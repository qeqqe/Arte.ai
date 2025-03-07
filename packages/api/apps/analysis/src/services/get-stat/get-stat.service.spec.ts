import { Test, TestingModule } from '@nestjs/testing';
import { GetStatService } from './get-stat.service';

describe('GetStatService', () => {
  let service: GetStatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetStatService],
    }).compile();

    service = module.get<GetStatService>(GetStatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
