import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

app.post('/addFile', (req: Request, res: Response) => {
  const { pathname } = req.body;
  const fileID = uuidv4();
  res.json({ added: true, fileID });
});

app.post('/deleteFile', (req: Request, res: Response) => {
  const { fileID } = req.body;
  res.json({ deleted: true });
});

app.get('/getFileID', (req: Request, res: Response) => {
  const { pathname } = req.query;
  res.json({ fileID: uuidv4() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
