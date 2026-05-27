import express from 'express';
import { documentStore } from '../data/store';

const router = express.Router();

router.get('/', (req, res) => {
  const documents = documentStore.getAll();
  res.json({ success: true, data: documents });
});

router.get('/team/:teamId', (req, res) => {
  const documents = documentStore.getByTeamId(req.params.teamId);
  res.json({ success: true, data: documents });
});

router.post('/', (req, res) => {
  const { userId, teamId, fileName, content } = req.body;
  if (!userId || !teamId || !fileName || !content) {
    return res.status(400).json({ success: false, message: '所有字段不能为空' });
  }
  const document = documentStore.create(userId, teamId, fileName, content);
  res.json({ success: true, data: document });
});

export default router;