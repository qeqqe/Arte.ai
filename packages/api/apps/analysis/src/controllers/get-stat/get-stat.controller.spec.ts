import { Test, TestingModule } from '@nestjs/testing';
import { GetStatController } from './get-stat.controller';

describe('GetStatController', () => {
  let controller: GetStatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetStatController],
    }).compile();

    controller = module.get<GetStatController>(GetStatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
