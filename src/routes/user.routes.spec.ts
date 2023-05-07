import request from 'supertest';

import app from '../app';

let token: string;

describe('user routes', () => {
  beforeAll(async () => {
    await app.startServer();

    const result = await request(app.express).post('/api/session/create').send({
      username: 'admin',
      password: 'Admin@123',
    });

    token = result.body.token;
  });

  afterAll(async () => {
    await app.closeServer();
  });

  describe('GET /find-many', () => {
    it('returns with status 200', async () => {
      const result = await request(app.express)
        .get('/api/user/find-many')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      const [users, usersCount] = result.body;

      expect(result.status).toEqual(200);
      expect(usersCount).toEqual(1);
      expect(users[0]).toEqual({
        id: 1,
        name: 'Admin',
        avatar: null,
        username: 'admin',
        email: 'admin@admin.com',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletionDate: null,
      });
    });
  });

  describe('POST /user/create', () => {
    it('returns with status 200', async () => {
      const result = await request(app.express).post('/api/user/create').send({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@doe.com',
        password: 'John@123',
      });

      expect(result.status).toEqual(200);
      expect(result.body).toEqual({
        id: 2,
        name: 'John Doe',
        avatar: null,
        username: 'johndoe',
        email: 'john@doe.com',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletionDate: null,
      });
    });
  });
});
