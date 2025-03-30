import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mysql from 'mysql2/promise';
import { Logger } from 'nestjs-pino';
import { OnModuleInit } from '@nestjs/common';
import { OpenAi as OpenAIService } from '../open-ai-service/open-ai.service';

interface SkillsData {
  [category: string]: string[];
}

@Injectable()
export class SingleStore implements OnModuleInit {
  private pool: mysql.Pool;
  private useVectorIndex = true;
  private isConnected = false;
  private readonly EMBEDDING_DIMENSION: number;

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly openAIService: OpenAIService,
  ) {
    this.EMBEDDING_DIMENSION = this.configService.get<number>(
      'EMBEDDING_DIMENSION',
      3072,
    );
  }

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: this.configService.getOrThrow<string>('SINGLESTORE_HOST'),
      port: this.configService.getOrThrow<number>('SINGLESTORE_PORT'),
      user: this.configService.getOrThrow<string>('SINGLESTORE_USER'),
      password: this.configService.getOrThrow<string>('SINGLESTORE_PASSWORD'),
      database: this.configService.getOrThrow<string>('SINGLESTORE_DATABASE'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 30000,
      ssl: {
        rejectUnauthorized:
          this.configService.getOrThrow<string>('NODE_ENV') == 'development'
            ? false
            : true,
      },
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      this.logger.log('test connection successful');
      connection.release();
      this.isConnected = true;
      return true;
    } catch (error) {
      this.logger.error('test connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async initialize(): Promise<void> {
    try {
      this.logger.log('initializing singlestore database');

      // verify connection without creating a new one
      if (!this.isConnected) {
        const connectionTest = await this.testConnection();
        if (!connectionTest) {
          throw new Error('failed to establish database connection');
        }
      }

      const connection = await this.pool.getConnection();

      try {
        // use transaction to ensure all operations succeed or fail together
        await connection.beginTransaction();

        this.logger.log('creating skill_categories table');
        await connection.query(`
          CREATE TABLE IF NOT EXISTS skill_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(100) NOT NULL,
            skill VARCHAR(255) NOT NULL,
            embedding JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY(category, skill),
            INDEX(category),
            INDEX(skill)
          );
        `);

        // verify table was created
        const [skillTablesResult] = await connection.query(
          "SHOW TABLES LIKE 'skill_categories'",
        );
        if (
          Array.isArray(skillTablesResult) &&
          skillTablesResult.length === 0
        ) {
          throw new Error('failed to create skill_categories table');
        }

        this.logger.log('creating job_posting table');
        await connection.query(`
          CREATE TABLE IF NOT EXISTS job_posting (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_id VARCHAR(255) UNIQUE,
            posting_text TEXT NOT NULL,
            posting_title VARCHAR(255),
            posting_embedding JSON,
            extracted_skills JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(job_id)
          );
        `);

        // create vector index
        try {
          this.logger.log(
            `creating vector index with dimension ${this.EMBEDDING_DIMENSION}`,
          );
          await connection.query(`
            CREATE VECTOR INDEX IF NOT EXISTS job_posting_vector_idx
            ON job_posting(posting_embedding)
            DIMENSION = ${this.EMBEDDING_DIMENSION}
            USING DOT_PRODUCT;
          `);

          this.useVectorIndex = true;
          this.logger.log('vector index created successfully');
        } catch (indexError) {
          this.logger.warn(
            'vector index creation failed, falling back to alternative storage method',
            indexError,
          );
          this.useVectorIndex = false;

          try {
            this.logger.log('creating alternative vector storage table');
            await connection.query(`
              CREATE TABLE IF NOT EXISTS vector_indexes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vector_id INT NOT NULL,
                vector JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (vector_id)
              );
            `);
            this.logger.log('alternative vector storage table created');
          } catch (altError) {
            this.logger.warn(
              'alternative vector storage creation failed',
              altError,
            );
            throw new Error('could not create any vector storage solution');
          }
        }

        await connection.commit();
        this.logger.log('database initialization completed successfully');
      } catch (error) {
        await connection.rollback();
        this.logger.error('database initialization failed', error);
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      this.logger.error('initialization error', error);
      throw new Error(`failed to initialize database: ${error.message}`);
    }
  }

  async storeSkillData(skillData: SkillsData): Promise<void> {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const allSkills: { skill: string; category: string }[] = [];

      // collect all valid skills across categories
      for (const [category, skills] of Object.entries(skillData)) {
        if (!Array.isArray(skills)) {
          this.logger.warn(`invalid skills data for category: ${category}`);
          continue;
        }

        for (const skill of skills) {
          if (skill && skill.trim() !== '') {
            allSkills.push({ skill, category });
          }
        }
      }

      if (allSkills.length === 0) {
        this.logger.log('no valid skills to process');
        await connection.commit();
        return;
      }

      this.logger.log(`storing ${allSkills.length} skills in the database`);

      // extract skill texts for batch embedding
      const skillTexts = allSkills.map((item) => item.skill);

      // generate embeddings in batch
      const embeddings = await this.openAIService.generateEmbeddingsBatch(
        skillTexts,
      );

      // prepare values for batch insert
      const insertValues = allSkills.map((item, index) => [
        item.category,
        item.skill,
        JSON.stringify(embeddings[index]),
      ]);

      // insert in smaller batches to avoid packet size limits
      const batchSize = 100;
      for (let i = 0; i < insertValues.length; i += batchSize) {
        const batch = insertValues.slice(i, i + batchSize);

        // execute batch insert with IGNORE to handle duplicates
        await connection.query(
          `
          INSERT IGNORE INTO skill_categories (category, skill, embedding)
          VALUES ${batch.map(() => '(?, ?, ?)').join(', ')}
          `,
          batch.flat(),
        );

        this.logger.log(
          `batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
            insertValues.length / batchSize,
          )} complete`,
        );
      }

      await connection.commit();
      this.logger.log('skill data stored successfully');
    } catch (error) {
      await connection.rollback();
      this.logger.error('error storing skill data:', error);
      throw new Error(`failed to store skill data: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  async storeJobPosting(
    jobId: string,
    postingText: string,
    postingTitle?: string,
    extractedSkills?: SkillsData,
  ): Promise<number> {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      this.logger.log(`generating embedding for job posting ${jobId}`);
      const embedding = await this.openAIService.generateEmbedding(postingText);

      // insert job posting with all available fields
      const [result] = await connection.query(
        `INSERT INTO job_posting 
        (job_id, posting_text, posting_title, posting_embedding, extracted_skills)
        VALUES (?, ?, ?, ?, ?)`,
        [
          jobId,
          postingText,
          postingTitle || null,
          JSON.stringify(embedding),
          extractedSkills ? JSON.stringify(extractedSkills) : null,
        ],
      );

      const insertId = (result as mysql.ResultSetHeader).insertId;

      // if vector index isn't available, store in alternative table
      if (!this.useVectorIndex) {
        this.logger.log(`storing vector in alternative table for job ${jobId}`);
        await connection.query(
          'INSERT INTO vector_indexes (vector_id, vector) VALUES (?, ?)',
          [insertId, JSON.stringify(embedding)],
        );
      }

      await connection.commit();
      this.logger.log(
        `job posting ${jobId} stored successfully with ID ${insertId}`,
      );

      return insertId;
    } catch (error) {
      await connection.rollback();
      this.logger.error(
        `error storing job posting: ${error.message}`,
        error.stack,
      );
      throw new Error(`failed to store job posting: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}
