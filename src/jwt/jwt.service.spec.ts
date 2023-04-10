import { Test } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from '../common/common.constants';

const TEST_KEY = 'testKey';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('sign', () => {
    it('사인된 토큰 반환', () => {

    });

  });
});