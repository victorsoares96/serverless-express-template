import request from 'supertest';

import Server from '../server';
import Database from '@/database/database.mock';
import generateRandomNumber from '@/utils/generate-random-number.util';

let token: string;

describe('user routes', () => {
  const database = new Database();
  const server = new Server();

  beforeAll(async () => {
    const connection = await database.connect();
    await server.startServer(connection, generateRandomNumber(4000, 5000));

    const result = await request(server.express)
      .post('/api/session/create')
      .send({
        username: 'admin',
        password: 'Admin@123',
      });

    token = result.body.token;
  });

  beforeEach(async () => {
    await database.clear();
    await database.seed();
  });

  afterAll(async () => {
    await server.closeServer();
  });

  describe('GET /find-many', () => {
    it('returns with status 200', async () => {
      const result = await request(server.express)
        .get('/api/user/find-many')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      const [users, usersCount] = result.body;

      expect(result.status).toEqual(200);
      expect(usersCount).toEqual(1);
      expect(users[0]).toHaveProperty('name', 'John Doe');
    });
  });

  describe('POST /user/create', () => {
    it('returns with status 200', async () => {
      const result = await request(server.express)
        .post('/api/user/create')
        .send({
          name: 'Jane Doe',
          username: 'janedoe',
          email: 'jane@doe.com',
          password: 'Jane@123',
        });

      expect(result.status).toEqual(200);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('name', 'Jane Doe');
    });
  });
});
