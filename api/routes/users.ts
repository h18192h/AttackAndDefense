import express from 'express';
import { userStore } from '../data/database';

const router = express.Router();

router.get('/', (req, res) => {
  const users = userStore.getAll();
  res.json({ success: true, data: users });
});

router.get('/:id', (req, res) => {
  const user = userStore.getById(req.params.id);
  if (user) {
    const { password, ...userWithoutPassword } = user as any;
    res.json({ success: true, data: userWithoutPassword });
  } else {
    res.status(404).json({ success: false, message: '用户不存在' });
  }
});

router.post('/', (req, res) => {
  const { username, password, role, teamId } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: '用户名、密码和角色不能为空' });
  }
  if (userStore.getByUsername(username)) {
    return res.status(400).json({ success: false, message: '用户名已存在' });
  }
  const user = userStore.create(username, password, role, teamId);
  res.json({ success: true, data: user });
});

router.put('/:id', (req, res) => {
  const { username, role, teamId } = req.body;
  const updateData: any = {};
  if (username) updateData.username = username;
  if (role) updateData.role = role;
  if (teamId !== undefined) updateData.teamId = teamId;
  
  const user = userStore.update(req.params.id, updateData);
  if (user) {
    res.json({ success: true, data: user });
  } else {
    res.status(404).json({ success: false, message: '用户不存在' });
  }
});

router.put('/:id/password', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: '密码不能为空' });
  }
  const user = userStore.update(req.params.id, { password });
  if (user) {
    res.json({ success: true, data: user, message: '密码更新成功' });
  } else {
    res.status(404).json({ success: false, message: '用户不存在' });
  }
});

router.delete('/:id', (req, res) => {
  const success = userStore.delete(req.params.id);
  if (success) {
    res.json({ success: true, message: '删除成功' });
  } else {
    res.status(404).json({ success: false, message: '用户不存在' });
  }
});

export default router;