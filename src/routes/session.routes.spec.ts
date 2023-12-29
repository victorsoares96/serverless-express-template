import request from 'supertest';

import { hash } from 'bcryptjs';
import Server from '../server';
import Database from '@/database/database.mock';
import generateRandomNumber from '@/utils/generate-random-number.util';
import { createFakeUser } from '@/mocks/user.mock';

describe('session routes', () => {
  const database = new Database();
  const server = new Server();

  beforeAll(async () => {
    const connection = await database.connect();
    await server.startServer(connection, generateRandomNumber(4000, 5000));
  });

  beforeEach(async () => {
    await database.clear();
    await database.seed();
  });

  afterAll(async () => {
    await server.closeServer();
  });

  describe('POST /create', () => {
    it('returns auth response with status 200', async () => {
      const password = await hash('Admin@123', 8);
      await database.createUsers(undefined, [
        createFakeUser({ username: 'admin', password }),
      ]);

      const result = await request(server.express)
        .post('/api/session/create')
        .send({
          username: 'admin',
          password: 'Admin@123',
        });

      expect(result.status).toEqual(200);
      expect(result.body).toHaveProperty('token');
      expect(result.body).toHaveProperty('user');
      expect(result.body.user).toHaveProperty('id');
      expect(result.body.user).toHaveProperty('username', 'admin');
      expect(result.body.user).toHaveProperty('deletionDate', null);
    });

    it('returns auth response with status 400 - Username is required', async () => {
      const result = await request(server.express)
        .post('/api/session/create')
        .send({
          username: '',
          password: 'Admin@1234',
        });

      expect(result.status).toEqual(400);
      expect(result.body).toHaveProperty('message', 'Validation failed');
      expect(result.body.validation.body).toHaveProperty(
        'message',
        '"username" is not allowed to be empty',
      );
    });

    it('returns auth response with status 400 - Password is required', async () => {
      const result = await request(server.express)
        .post('/api/session/create')
        .send({
          username: 'admin',
          password: '',
        });

      expect(result.status).toEqual(400);
      expect(result.body).toHaveProperty('message', 'Validation failed');
      expect(result.body.validation.body).toHaveProperty(
        'message',
        '"password" is not allowed to be empty',
      );
    });

    it('returns auth response with status 400 - username/password is incorrect', async () => {
      const result = await request(server.express)
        .post('/api/session/create')
        .send({
          username: 'admin',
          password: 'Admin@1234',
        });

      expect(result.status).toEqual(401);
      expect(result.body).toHaveProperty(
        'message',
        'Invalid username or password. Please, try again.',
      );
    });
  });
});
