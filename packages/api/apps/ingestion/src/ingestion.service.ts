import { Injectable } from '@nestjs/common';

@Injectable()
export class IngestionService {
  getHello(): string {
    return 'Hello World!';
  }
}
