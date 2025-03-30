import { Test, TestingModule } from '@nestjs/testing';
import { OpenAi } from './open-ai.service';

describe('OpenAi', () => {
  let service: OpenAi;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAi],
    }).compile();

    service = module.get<OpenAi>(OpenAi);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
