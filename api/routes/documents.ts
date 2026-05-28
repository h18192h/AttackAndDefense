import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { documentStore, uploadLogStore } from '../data/database';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    const safeFilename = `${timestamp}_${random}${ext}`;
    cb(null, safeFilename);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

router.get('/', (req, res) => {
  const documents = documentStore.getAll();
  res.json({ success: true, data: documents });
});

router.get('/team/:teamId', (req, res) => {
  const documents = documentStore.getByTeamId(req.params.teamId);
  res.json({ success: true, data: documents });
});

router.get('/logs', (req, res) => {
  const logs = uploadLogStore.getAll();
  res.json({ success: true, data: logs });
});

router.get('/logs/:teamId', (req, res) => {
  const logs = uploadLogStore.getByTeamId(req.params.teamId);
  res.json({ success: true, data: logs });
});

router.get('/download/:id', (req, res) => {
  const document = documentStore.getById(req.params.id);
  if (!document) {
    return res.status(404).json({ success: false, message: '文档不存在' });
  }

  const filePath = path.join(uploadsDir, document.filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: '文件不存在' });
  }

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(document.fileName)}`);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

router.post('/', upload.single('file'), (req, res) => {
  const { userId, teamId } = req.body;
  const file = req.file;

  console.log('文件上传请求:', { userId, teamId, originalName: file ? file.originalname : null, storedName: file ? file.filename : null });

  if (!userId || !teamId) {
    return res.status(400).json({ success: false, message: '用户ID和队伍ID不能为空' });
  }

  if (!file) {
    return res.status(400).json({ success: false, message: '请选择要上传的文件' });
  }

  try {
    const document = documentStore.create(userId, teamId, file.originalname, file.filename);
    uploadLogStore.create(document.id, userId, teamId, file.originalname, file.size, 'upload');
    
    console.log('文件上传成功:', document);
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({ success: false, message: '文件上传失败' });
  }
});

router.delete('/:id', (req, res) => {
  const document = documentStore.getById(req.params.id);
  if (!document) {
    return res.status(404).json({ success: false, message: '文档不存在' });
  }

  const filePath = path.join(uploadsDir, document.filePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  uploadLogStore.create(document.id, document.userId, document.teamId, document.fileName, 0, 'delete');
  
  const success = documentStore.delete(req.params.id);
  if (success) {
    res.json({ success: true, message: '删除成功' });
  } else {
    res.status(404).json({ success: false, message: '删除失败' });
  }
});

export default router;