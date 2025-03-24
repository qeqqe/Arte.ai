import { Test, TestingModule } from '@nestjs/testing';
import { LeetcodeService } from './leetcode.service';
import { HttpService } from '@nestjs/axios';
import { DRIZZLE_PROVIDER } from '@app/common';
import { Logger } from '@nestjs/common';

describe('LeetcodeService', () => {
  let service: LeetcodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeetcodeService,
        { provide: HttpService, useValue: { post: jest.fn() } },
        { provide: DRIZZLE_PROVIDER, useValue: {} },
        { provide: Logger, useValue: { log: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    service = module.get<LeetcodeService>(LeetcodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
