import request from "supertest";
import express from "express";
import router from "../../src/routes/fileRouter.js";
import db from "../../src/db/index.js";
import { generateDownloadLink } from "../../src/aws.js";
const mockGet = jest.fn();

jest.mock("../../src/db/index", () => ({
  file: {
    get: jest.fn()
  }
}));


jest.mock('../../src/aws.js', () => ({
  generateDownloadLink: jest.fn(),
  generateUploadLink: jest.fn()
}));

jest.mock("../../src/utils/sizeConverter");

const app = express();
app.use(express.json());
app.use("/", router);

describe("File Operations Endpoints", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe("POST /addFile", () => {
    it ("should add a file to the database", async () => {}); 
  });

  describe("GET /downloadFile/:fileID", () => {
    it("should return a download link for a valid file ID", async () => {
      const mockFileID = "123";
      const mockFile = { fileName: "example", fileType: "pdf" };
      const mockDownloadLink = "https://mockdownloadlink.com/file.pdf";
      (db.file.get as jest.Mock).mockResolvedValue(mockFile);
      (generateDownloadLink as jest.Mock).mockReturnValue(mockDownloadLink);
      const response = await request(app).get(`/downloadFile/${mockFileID}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ link: mockDownloadLink });
      expect(generateDownloadLink).toHaveBeenCalledWith(
        mockFileID,
        `${mockFile.fileName}.${mockFile.fileType}`
      );
      expect(db.file.get).toHaveBeenCalledWith(mockFileID);
    });

    it("should return a 404 if the file is not found", async () => {
      const mockFileID = "notfound";
      (db.file.get as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(`/downloadFile/${mockFileID}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "File not found" });
    });

    it("should handle errors gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
      const mockFileID = "error";
      (db.file.get as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get(`/downloadFile/${mockFileID}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: true });
      expect(generateDownloadLink).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});
