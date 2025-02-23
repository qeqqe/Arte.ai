import { Controller, Get } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller()
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Get()
  getHello(): string {
    return this.ingestionService.getHello();
  }
}
