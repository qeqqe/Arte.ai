import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VectorDbService implements OnModuleInit {
  private qdrantUrl: string;
  private collectionName: string;
  private vectorSize = 3072;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.qdrantUrl = this.configService.get<string>(
      'QDRANT_URL',
      'http://localhost:6333',
    );
  }
  async onModuleInit() {
    try {
      // Check if collection exists, if not create it
      const collectionsResponse = await firstValueFrom(
        this.httpService.get(`${this.qdrantUrl}/collections`),
      );

      const collectionExists = collectionsResponse.data.collections.some(
        (c) => c.name === this.collectionName,
      );

      if (!collectionExists) {
        await this.createCollection();
      }
    } catch (error) {
      console.error('Failed to initialize vector DB:', error.message);
      // create collection anyway as the error might be that we can't list collections
      await this.createCollection();
    }
  }

  private async createCollection(): Promise<void> {
    await firstValueFrom(
      this.httpService.put(
        `${this.qdrantUrl}/collections/${this.collectionName}`,
        {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
        },
      ),
    );
  }

  async upsertVectors(points: any[]) {
    return firstValueFrom(
      this.httpService.put(
        `${this.qdrantUrl}/collections/${this.collectionName}/points`,
        {
          points: points.map((point) => ({
            id: point.id,
            vector: point.vector,
            payload: point.payload,
          })),
        },
      ),
    );
  }

  async search(vector: number[], limit = 30) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.qdrantUrl}/collections/${this.collectionName}/points/search`,
        {
          vector,
          limit,
        },
      ),
    );

    return response.data.result;
  }
}
