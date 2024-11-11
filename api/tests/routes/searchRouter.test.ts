import request from 'supertest';
import express, { Express } from 'express';
import router from '../../src/routes/searchRouter.js';
import db from '../../src/db/index.js';

jest.mock('../../src/db/index.js', () => ({
  search: jest.fn(),
}));

describe('Search Router', () => {
  let app: Express;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('GET /search', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app)
        .get('/search')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Query parameter is required'
      });

      expect(db.search).not.toHaveBeenCalled();
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app)
        .get('/search?query=')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Query parameter is required'
      });
      expect(db.search).not.toHaveBeenCalled();
    });

    it('should return search results for valid query', async () => {
      const mockResults = [
        { id: 1, name: 'test1.txt', type: 'file' },
        { id: 2, name: 'test2.pdf', type: 'file' }
      ];
      (db.search as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/search?query=test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockResults);

      expect(db.search).toHaveBeenCalledTimes(1);
      expect(db.search).toHaveBeenCalledWith('test');
    });

    it('should handle special characters in query', async () => {
      const mockResults = [
        { id: 1, name: 'test@file.txt', type: 'file' }
      ];
      (db.search as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/search?query=test@file')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockResults);
      expect(db.search).toHaveBeenCalledWith('test@file');
    });

    it('should return empty array when no results found', async () => {
      const mockResults: never[] = [];
      (db.search as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/search?query=nonexistent')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual([]);
      expect(db.search).toHaveBeenCalledWith('nonexistent');
    });

    it('should handle database errors', async () => {
      (db.search as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/search?query=test')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: true });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(db.search).toHaveBeenCalledWith('test');
    });

    it('should handle multiple query parameters and merge them together', async () => {
      const mockResults = [{ id: 1, name: 'test1.txt', type: 'file' }];
      (db.search as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/search?query=test1&query=test2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockResults);
      expect(db.search).toHaveBeenCalledWith('test1,test2');
    });

    it('should properly decode URL-encoded query parameters', async () => {
      const mockResults = [{ id: 1, name: 'test file.txt', type: 'file' }];
      (db.search as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/search?query=test%20file')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockResults);
      expect(db.search).toHaveBeenCalledWith('test file');
    });

    it('should handle large query parameters', async () => {
      const longQuery = 'a'.repeat(1000);
      const mockResults = [{ id: 1, name: 'test.txt', type: 'file' }];
      (db.search as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app)
        .get(`/search?query=${longQuery}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockResults);
      expect(db.search).toHaveBeenCalledWith(longQuery);
    });
  });
});