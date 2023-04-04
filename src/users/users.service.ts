import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
  }

  async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean, error?: string }> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return {
          ok: false,
          error: '이미 이메일을 가진 사용자가 있습니다.',
        };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: '계정을 생성할 수 없습니다.',
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<{ ok: boolean, error?: string, token?: string }> {
    try {
      const user = await this.users.findOne({ where: { email } });
      if (!user) {
        return {
          ok: false,
          error: 'User를 찾을 수 없습니다',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: '잘못된 비밀번호 입니다',
        };
      }
      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ where: { id } });
  }

  async editProfile(userId: number, editProfileInput: EditProfileInput) {
    return await this.users.update(userId, editProfileInput);
  }
}