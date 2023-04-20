import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

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
    const EMAIL = 'jio@naver.com';

    it('계정 생성', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation {
           createAccount(input:{
             email:"${EMAIL}",
             password:"123",
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
  });


  it.todo('me');
  it.todo('userProfile');
  it.todo('login');
  it.todo('editProfile');
  it.todo('verifyEmail');


});
