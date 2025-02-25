import { Test, TestingModule } from '@nestjs/testing';
import { LinkedinController } from './linkedin.controller';

describe('LinkedinController', () => {
  let controller: LinkedinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkedinController],
    }).compile();

    controller = module.get<LinkedinController>(LinkedinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
