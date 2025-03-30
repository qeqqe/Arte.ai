import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import OpenAI from 'openai';
import { OnModuleInit } from '@nestjs/common';
@Injectable()
export class OpenAi implements OnModuleInit {
  private client: OpenAI;
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
      baseURL: this.configService.getOrThrow<string>('BASE_URL'),
      timeout: 30000,
      maxRetries: 2,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      this.logger.log(`Generating embedding for text of length ${text.length}`);
      const startTime = Date.now();

      const response = (await Promise.race([
        this.client.embeddings.create({
          model: this.configService.get<string>(
            'EMBED_MODEL',
            'text-embedding-3-large',
          ),
          input: text,
        }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(new Error('Embedding request timed out after 30 seconds')),
            30000,
          ),
        ),
      ])) as any;

      this.logger.log(`Embedding generated in ${Date.now() - startTime}ms`);

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Error generating embedding', error);
      throw error;
    }
  }

  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    try {
      const validTexts = texts.filter((text) => text && text.trim() !== '');

      if (validTexts.length === 0) {
        return [];
      }

      this.logger.log(
        `starting batch embedding generation for ${validTexts.length} texts`,
      );
      const startTime = Date.now();
      const embedModel = this.configService.get<string>(
        'EMBED_MODEL',
        'text-embedding-3-large',
      );

      // create embeddings in batches to avoid api limits
      const batchSize = 20;
      const embeddings: number[][] = [];

      for (let i = 0; i < validTexts.length; i += batchSize) {
        const batch = validTexts.slice(i, i + batchSize);
        this.logger.log(
          `processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
            validTexts.length / batchSize,
          )}`,
        );

        const response = (await Promise.race([
          this.client.embeddings.create({
            model: embedModel,
            input: batch,
          }),
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(new Error('batch request timed out after 30 seconds')),
              30000,
            ),
          ),
        ])) as any;

        embeddings.push(
          ...response.data.map(
            (item: { embedding: number[] }) => item.embedding,
          ),
        );
        this.logger.log(`batch ${Math.floor(i / batchSize) + 1} complete`);
      }

      this.logger.log(
        `batch embedding generation complete in ${Date.now() - startTime}ms`,
      );
      return embeddings;
    } catch (error) {
      this.logger.error('error generating batch embeddings:', error);
      throw error;
    }
  }
}
