import { Test, TestingModule } from '@nestjs/testing';
import { LeetcodeController } from './leetcode.controller';
import { LeetcodeService } from '../../services/leetcode/leetcode.service';
import { JwtAuthGuard } from '@app/common';

describe('LeetcodeController', () => {
  let controller: LeetcodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeetcodeController],
      providers: [
        {
          provide: LeetcodeService,
          useValue: { fetchData: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LeetcodeController>(LeetcodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
