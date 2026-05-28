import express from 'express';
import { teamStore } from '../data/database';

const router = express.Router();

router.get('/', (req, res) => {
  const teams = teamStore.getAll();
  res.json({ success: true, data: teams });
});

router.get('/:id', (req, res) => {
  const team = teamStore.getById(req.params.id);
  if (team) {
    res.json({ success: true, data: team });
  } else {
    res.status(404).json({ success: false, message: '队伍不存在' });
  }
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: '队伍名称不能为空' });
  }
  const team = teamStore.create(name);
  res.json({ success: true, data: team });
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: '队伍名称不能为空' });
  }
  const team = teamStore.update(req.params.id, name);
  if (team) {
    res.json({ success: true, data: team });
  } else {
    res.status(404).json({ success: false, message: '队伍不存在' });
  }
});

router.delete('/:id', (req, res) => {
  const success = teamStore.delete(req.params.id);
  if (success) {
    res.json({ success: true, message: '删除成功' });
  } else {
    res.status(404).json({ success: false, message: '队伍不存在' });
  }
});

export default router;