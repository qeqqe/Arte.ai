import { Test, TestingModule } from '@nestjs/testing';
import { CompareController } from './compare.controller';

describe('CompareController', () => {
  let controller: CompareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompareController],
    }).compile();

    controller = module.get<CompareController>(CompareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
