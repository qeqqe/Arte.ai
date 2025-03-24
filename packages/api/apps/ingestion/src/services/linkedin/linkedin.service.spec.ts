import { Test, TestingModule } from '@nestjs/testing';
import { LinkedinService } from './linkedin.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE_PROVIDER } from '@app/common';
import { of } from 'rxjs';

describe('LinkedinService', () => {
  let service: LinkedinService;
  let httpService: HttpService;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn(),
    };

    const mockDrizzle = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkedinService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDrizzle,
        },
      ],
    }).compile();

    service = module.get<LinkedinService>(LinkedinService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
