import request from 'supertest';
import express, { Express } from 'express';
import router from '../../src/routes/authRouter.js';
import { generateToken } from '../../src/utils/auth.js';

jest.mock('../../src/utils/auth.js', () => ({
  generateToken: jest.fn()
}));

jest.mock('../../src/utils/envPath.js', () => ({
  getEnvPath: jest.fn().mockReturnValue('.env.test')
}));

const originalEnv = process.env;


describe('Auth Router', () => {
  let app: Express;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    app = express();
    app.use(express.json());
    app.use('/', router);

    process.env = { 
      ...originalEnv,
      USERNAME: 'testuser',
      PASSWORD: 'testpass'
    };

    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.env = originalEnv;
  });

  describe('POST /login', () => {
    it('should return token for valid credentials', async () => {
      const mockToken = 'mock-jwt-token';
      (generateToken as jest.Mock).mockReturnValue(mockToken);

      const credentials = {
        username: 'testuser',
        password: 'testpass'
      };

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({ token: mockToken });
      expect(generateToken).toHaveBeenCalledWith({
        id: 1,
        username: 'testuser'
      });
      expect(generateToken).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for invalid username', async () => {
      const credentials = {
        username: 'wronguser',
        password: 'testpass'
      };

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid password', async () => {
      const credentials = {
        username: 'testuser',
        password: 'wrongpass'
      };

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should return 401 for empty credentials', async () => {
      const credentials = {
        username: '',
        password: ''
      };

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should return 401 for missing username', async () => {
      const credentials = {
        password: 'testpass'
      };

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should return 401 for missing password', async () => {
      const credentials = {
        username: 'testuser'
      };

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should handle missing environment variables', async () => {
      delete process.env.USERNAME;
      delete process.env.PASSWORD;

      const credentials = {
        username: 'testuser',
        password: 'testpass'
      };

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should handle case-sensitive credentials', async () => {
      const credentials = {
        username: 'TESTUSER', 
        password: 'testpass'
      };

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should handle whitespace in credentials', async () => {
      const credentials = {
        username: ' testuser ',
        password: ' testpass '
      };

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
      expect(generateToken).not.toHaveBeenCalled();
    });

    it('should handle token generation failure', async () => {
      const credentials = {
        username: 'testuser',
        password: 'testpass'
      };

      (generateToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      const response = await request(app)
        .post('/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: true });
      expect(generateToken).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});