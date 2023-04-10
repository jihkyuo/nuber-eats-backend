import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from '../jwt/jwt.service';
import { MailService } from '../mail/mail.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => '인증된 토큰 Mocked'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe('UserService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'mockemail',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: '이미 이메일을 가진 사용자가 있습니다.',
      });
    });

    it('새로운 유저 생성', async () => {
      /** for user test */
      usersRepository.findOne.mockResolvedValue(undefined); // user 가 없다고 속임
      usersRepository.create.mockReturnValue(createAccountArgs);

      /** for verification test */
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });

      /** for mailService test */
      verificationRepository.save.mockResolvedValue({
        code: 'code',
      });
      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1); // 단 한번 호출될거라 기대
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String));

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('에러 발생'));
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: '계정을 생성할 수 없습니다.',
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@test.com',
      password: '123',
    };

    it('에러 결과', async () => {
      const error = new Error('에러 발생');
      usersRepository.findOne.mockRejectedValue(error);
      const result = await service.login(loginArgs);

      expect(result).toEqual({
        ok: false,
        error,
      });
    });

    it('user를 찾지 못했을 경우 결과', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));

      expect(result).toEqual({
        ok: false,
        error: 'User를 찾을 수 없습니다',
      });
    });

    it('password가 잘못됐을 경우 실패', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);

      expect(result).toEqual({
        ok: false,
        error: '잘못된 비밀번호 입니다',
      });
    });

    it('password 가 일치하면, token 을 return 해야함', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));

      expect(result).toEqual({
        ok: true,
        token: '인증된 토큰 Mocked',
      });
    });
  });

  describe('findById', () => {
    const findByIdArg = { id: 1 };

    it('user가 존재', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArg);
      const result = await service.findById(findByIdArg.id);

      expect(result).toEqual({ ok: true, user: findByIdArg });
    });

    it('user가 존재하지 하지 않을 때', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error('에러 발생'));
      const result = await service.findById(findByIdArg.id);

      expect(result).toEqual({
        ok: false,
        error: '유저를 찾을 수 없습니다',
      });
    });
  });

  describe('editProfile', () => {
    it('이메일 변경', async () => {
      const oldUser = {
        email: 'jio@old.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'jio@new.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: editProfileArgs.userId },
      });

      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email, newVerification.code);
    });

    it('비밀번호 변경', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: '123' },
      };

      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);

      expect(result).toEqual({ ok: true });
    });

    it('에러', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: '123' },
      };

      usersRepository.findOne.mockRejectedValue(new Error('Error'));
      const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(result).toEqual({
        ok: false,
        error: '프로필을 업데이트 할 수 없습니다.',
      });
    });
  });
  it.todo('verifyEmail');
});