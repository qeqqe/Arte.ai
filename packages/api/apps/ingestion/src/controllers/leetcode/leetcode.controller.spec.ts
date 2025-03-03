import { Test, TestingModule } from '@nestjs/testing';
import { LeetcodeController } from './leetcode.controller';

describe('LeetcodeController', () => {
  let controller: LeetcodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeetcodeController],
    }).compile();

    controller = module.get<LeetcodeController>(LeetcodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
