import { Test, TestingModule } from '@nestjs/testing';
import { SingleStore } from './single-store.service';

describe('SingleStore', () => {
  let service: SingleStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SingleStore],
    }).compile();

    service = module.get<SingleStore>(SingleStore);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
