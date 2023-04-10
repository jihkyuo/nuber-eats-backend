import { Test } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from '../common/common.constants';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'Mocked TOKEN'),
  };
});

const TEST_PRIVATE_KEY = 'testKey';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_PRIVATE_KEY },
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
      const mockedSignArg = {
        userId: 1,
      };
      const token = jwtService.sign(mockedSignArg.userId);

      expect(jwt.sign).toHaveBeenCalledTimes(1)
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockedSignArg.userId },
        TEST_PRIVATE_KEY
      );
    });
  });

  describe('verify', () => {

  })
});