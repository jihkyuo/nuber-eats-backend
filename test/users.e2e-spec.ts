import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});
const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: 'jio@naver.com',
  password: '123',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'jiohyeon',
      password: '12345',
      database: 'nuber-eats-test',
    });
    const connection = await dataSource.initialize();
    await connection.dropDatabase();
    await connection.destroy();

    await app.close();
  });

  describe('createAccount', () => {

    it('계정 생성', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation {
           createAccount(input:{
             email:"${testUser.email}",
             password:"${testUser.password}",
             role:Client
           }){
             ok
             error
           }
        }
        `,
      }).expect(200).expect(res => {
        expect(res.body.data.createAccount.ok).toBe(true);
        expect(res.body.data.createAccount.error).toBeNull();
      });
    });

    it('계정이 이미 있을경우, 계정 생성 실패', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation {
           createAccount(input:{
             email:"${testUser.email}",
             password:"${testUser.password}",
             role:Client
           }){
             ok
             error
           }
        }
        `,
      }).expect(200).expect(res => {
        expect(res.body.data.createAccount.ok).toBe(false);
        expect(res.body.data.createAccount.error).toBe('이미 이메일을 가진 사용자가 있습니다.');
      });
    });
  });

  describe('login', () => {
    it('토큰 검증이 됐을 때, 로그인 성공', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation {
            login(input:{
              email:"${testUser.email}",
              password:"${testUser.password}"
            }){
              ok
              error
              token
            }
          }
        `,
      }).expect(200).expect(res => {
        const { body: { data: { login: { ok, error, token } } } } = res;
        jwtToken = token;

        expect(ok).toBe(true);
        expect(error).toBeNull();
        expect(token).toEqual(expect.any(String));
      });
    });

    it('토큰 검증 실패, 로그인 실패', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation {
            login(input:{
              email:"${testUser.email}",
              password:"${testUser.password}error"
            }){
              ok
              error
              token
            }
          }
        `,
      }).expect(200).expect(res => {
        const { body: { data: { login: { ok, error, token } } } } = res;
        expect(ok).toBe(false);
        expect(error).toBe('잘못된 비밀번호 입니다');
        expect(token).toBeNull();
      });
    });
  });

  it.todo('me');
  it.todo('userProfile');
  it.todo('editProfile');
  it.todo('verifyEmail');


});
