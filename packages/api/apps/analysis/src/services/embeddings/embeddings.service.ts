import { HttpService } from '@nestjs/axios';
import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingsService {
  private OPENDAI_API_KEY: string;
  private EMBED_MODEL: string;
  private BASE_URL: string;
  private openAiClient: OpenAI;
  constructor(
    private readonly httpService: HttpService,
    private readonly configServce: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    this.OPENDAI_API_KEY = this.configServce.get<string>('OPENAI_API_KEY');
    this.EMBED_MODEL = this.configServce.get<string>('EMBED_MODEL');
    this.BASE_URL = this.configServce.get<string>('BASE_URL');
    this.openAiClient = new OpenAI({
      apiKey: this.OPENDAI_API_KEY,
      baseURL: this.BASE_URL,
      timeout: 10000,
    });
  }

  async getEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.openAiClient.embeddings.create({
      input: texts,
      model: this.EMBED_MODEL,
      encoding_format: 'float',
    });
    return response.data.map((item) => item.embedding);
  }
}
