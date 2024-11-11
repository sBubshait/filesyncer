import request from 'supertest';
import express, { Express } from 'express';
import router from '../../src/routes/folderRouter.js';
import db from '../../src/db/index.js';

jest.mock('../../src/db/index.js', () => ({
  folder: {
    get: jest.fn(),
    getContents: jest.fn(),
  }
}));

describe('Folder Router', () => {
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

  describe('GET /getFolder/:folderID', () => {
    it('should return folder and its contents successfully', async () => {
      const mockFolder = {
        folderID: 'test-folder',
        folderName: 'Test Folder'
      };
      const mockContents = [
        { id: 1, name: 'file1.txt' },
        { id: 2, name: 'file2.pdf' }
      ];

      (db.folder.get as jest.Mock).mockResolvedValue(mockFolder);
      (db.folder.getContents as jest.Mock).mockResolvedValue(mockContents);

      const response = await request(app)
        .get('/getFolder/test-folder')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(db.folder.get).toHaveBeenCalledTimes(1);
      expect(db.folder.get).toHaveBeenCalledWith('test-folder');
      expect(db.folder.getContents).toHaveBeenCalledTimes(1);
      expect(db.folder.getContents).toHaveBeenCalledWith('test-folder');
      expect(response.body).toEqual({
        name: 'Test Folder',
        files: mockContents
      });
    });

    it('should return 404 when folder is not found', async () => {
      (db.folder.get as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/getFolder/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(db.folder.get).toHaveBeenCalledTimes(1);
      expect(db.folder.get).toHaveBeenCalledWith('nonexistent');
      expect(db.folder.getContents).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        error: 'Folder not found'
      });
    });

    it('should handle database errors when getting folder', async () => {
      (db.folder.get as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/getFolder/error-folder')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(db.folder.get).toHaveBeenCalledTimes(1);
      expect(db.folder.get).toHaveBeenCalledWith('error-folder');
      expect(db.folder.getContents).not.toHaveBeenCalled();
      expect(response.body).toEqual({ error: true });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle database errors when getting contents', async () => {
      const mockFolder = {
        folderID: 'test-folder',
        folderName: 'Test Folder'
      };
      
      (db.folder.get as jest.Mock).mockResolvedValue(mockFolder);
      (db.folder.getContents as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/getFolder/test-folder')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(db.folder.get).toHaveBeenCalledTimes(1);
      expect(db.folder.get).toHaveBeenCalledWith('test-folder');
      expect(db.folder.getContents).toHaveBeenCalledTimes(1);
      expect(db.folder.getContents).toHaveBeenCalledWith('test-folder');
      expect(response.body).toEqual({ error: true });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle empty folder contents', async () => {
      const mockFolder = {
        folderID: 'empty-folder',
        folderName: 'Empty Folder'
      };
      const mockContents: never[] = [];

      (db.folder.get as jest.Mock).mockResolvedValue(mockFolder);
      (db.folder.getContents as jest.Mock).mockResolvedValue(mockContents);

      const response = await request(app)
        .get('/getFolder/empty-folder')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(db.folder.get).toHaveBeenCalledTimes(1);
      expect(db.folder.get).toHaveBeenCalledWith('empty-folder');
      expect(db.folder.getContents).toHaveBeenCalledTimes(1);
      expect(db.folder.getContents).toHaveBeenCalledWith('empty-folder');
      expect(response.body).toEqual({
        name: 'Empty Folder',
        files: []
      });
    });
  });
});