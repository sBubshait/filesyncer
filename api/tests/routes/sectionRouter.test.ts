import request from 'supertest';
import express, { Express } from 'express';
import router from '../../src/routes/sectionRouter.js';
import db from '../../src/db/index.js';
import { convertBytes } from '../../src/utils/sizeConverter.js';

jest.mock('../../src/db/index.js', () => ({
  getOverview: jest.fn(),
  getHomeFiles: jest.fn(),
  getRecentFiles: jest.fn(),
  getFavouriteFiles: jest.fn(),
}));

jest.mock('../../src/utils/sizeConverter.js', () => ({
  convertBytes: jest.fn(),
}));

const storageType = process.env.STORAGE_TYPE || "MB";

describe('Section Router', () => {
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

  describe('GET /getOverview', () => {
    it('should return correct overview with storage calculations', async () => {
      const mockOverviewData = {
        fileCount: 42,
        favouriteCount: 7,
        totalSize: 1024,
      };
      (db.getOverview as jest.Mock).mockResolvedValue(mockOverviewData);
      (convertBytes as jest.Mock).mockReturnValue(1.0);

      const response = await request(app)
        .get('/getOverview')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(db.getOverview).toHaveBeenCalledTimes(1);
      expect(convertBytes).toHaveBeenCalledWith(1024, storageType);
      expect(response.body).toEqual({
        fileCount: 42,
        favouriteCount: 7,
        storage: {
          used: 1.0,
          total: 100,
          type: 'MB',
        },
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      (db.getOverview as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/getOverview')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(db.getOverview).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ error: true });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('GET /getSection/home', () => {
    it('should return home folders successfully', async () => {
      const mockHomeFolders = [
        { id: 1, name: 'folder1' },
        { id: 2, name: 'folder2' },
      ];
      (db.getHomeFiles as jest.Mock).mockResolvedValue(mockHomeFolders);

      const response = await request(app)
        .get('/getSection/home')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(db.getHomeFiles).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockHomeFolders);
    });

    it('should handle errors with 500 status', async () => {
      (db.getHomeFiles as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/getSection/home')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(db.getHomeFiles).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ error: true });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('GET /getSection/recent', () => {
    it('should return recent files successfully', async () => {
      const mockRecentFiles = [
        { id: 1, name: 'file1.txt', modified: '2024-01-01' },
        { id: 2, name: 'file2.pdf', modified: '2024-01-02' },
      ];
      (db.getRecentFiles as jest.Mock).mockResolvedValue(mockRecentFiles);

      const response = await request(app)
        .get('/getSection/recent')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(db.getRecentFiles).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockRecentFiles);
    });

    it('should handle errors with 500 status', async () => {
      (db.getRecentFiles as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/getSection/recent')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(db.getRecentFiles).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ error: true });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('GET /getSection/favourites', () => {
    it('should return favourite files successfully', async () => {
      const mockFavouriteFiles = [
        { id: 1, name: 'favourite1.doc', starred: true },
        { id: 2, name: 'favourite2.xls', starred: true },
      ];
      (db.getFavouriteFiles as jest.Mock).mockResolvedValue(mockFavouriteFiles);

      const response = await request(app)
        .get('/getSection/favourites')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(db.getFavouriteFiles).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockFavouriteFiles);
    });

    it('should handle errors with 500 status', async () => {
      (db.getFavouriteFiles as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/getSection/favourites')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(db.getFavouriteFiles).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ error: true });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Environment Variables', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should use default values when environment variables are not set', async () => {
      delete process.env.STORAGE_LIMIT;
      delete process.env.STORAGE_TYPE;
      const mockOverviewData = {
        fileCount: 10,
        favouriteCount: 5,
        totalSize: 1024,
      };
      (db.getOverview as jest.Mock).mockResolvedValue(mockOverviewData);
      (convertBytes as jest.Mock).mockReturnValue(1);

      const response = await request(app)
        .get('/getOverview')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        fileCount: 10,
        favouriteCount: 5,
        storage: {
          used: 1,
          total: 100, // Default value
          type: 'MB',
        },
      });
    });
  });
});