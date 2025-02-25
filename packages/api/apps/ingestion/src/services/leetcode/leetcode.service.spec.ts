import { Test, TestingModule } from '@nestjs/testing';
import { LeetcodeService } from './leetcode.service';

describe('LeetcodeService', () => {
  let service: LeetcodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeetcodeService],
    }).compile();

    service = module.get<LeetcodeService>(LeetcodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
