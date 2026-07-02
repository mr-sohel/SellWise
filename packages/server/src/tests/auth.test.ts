import request from 'supertest';
import app from '../app';
import { db } from '../config/db';
import bcrypt from 'bcryptjs';

describe('Auth Endpoints', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  beforeAll(async () => {
    // Clear users table before tests
    await db.query('DELETE FROM users WHERE email = $1', [testEmail]);
  });

  afterAll(async () => {
    // Cleanup
    await db.query('DELETE FROM users WHERE email = $1', [testEmail]);
  });

  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: testEmail,
        password: testPassword,
        preferred_lang: 'en'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data).toHaveProperty('storeId');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data).toHaveProperty('storeId');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});