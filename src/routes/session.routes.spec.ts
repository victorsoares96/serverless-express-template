import request from 'supertest';

import app from '../app';

describe('session routes', () => {
  beforeAll(async () => {
    await app.startServer();
  });

  afterAll(async () => {
    await app.closeServer();
  });

  describe('POST /create', () => {
    it('returns auth response with status 200', async () => {
      const result = await request(app.express)
        .post('/api/session/create')
        .send({
          username: 'admin',
          password: 'Admin@123',
        });

      expect(result.status).toEqual(200);
      expect(result.body).toHaveProperty('token');
      expect(result.body).toHaveProperty('user');
      expect(result.body.user).toHaveProperty('id', 1);
      expect(result.body.user).toHaveProperty('name', 'Admin');
      expect(result.body.user).toHaveProperty('username', 'admin');
      expect(result.body.user).toHaveProperty('email', 'admin@admin.com');
      expect(result.body.user).toHaveProperty('createdAt');
      expect(result.body.user).toHaveProperty('updatedAt');
      expect(result.body.user).toHaveProperty('deletionDate', null);
    });

    it('returns auth response with status 400 - Username is required', async () => {
      const result = await request(app.express)
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
      const result = await request(app.express)
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
      const result = await request(app.express)
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
