import { Test, TestingModule } from '@nestjs/testing';
import { VectorDbService } from './vector-db.service';

describe('VectorDbService', () => {
  let service: VectorDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VectorDbService],
    }).compile();

    service = module.get<VectorDbService>(VectorDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
