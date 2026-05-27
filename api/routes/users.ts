import express from 'express';
import { userStore } from '../data/store';

const router = express.Router();

router.get('/', (req, res) => {
  const users = userStore.getAll();
  const usersWithoutPassword = users.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    teamId: u.teamId,
    createdAt: u.createdAt,
  }));
  res.json({ success: true, data: usersWithoutPassword });
});

router.get('/:id', (req, res) => {
  const user = userStore.getById(req.params.id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
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
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, data: userWithoutPassword });
});

router.put('/:id', (req, res) => {
  const { username, role, teamId } = req.body;
  const updateData: any = {};
  if (username) updateData.username = username;
  if (role) updateData.role = role;
  if (teamId !== undefined) updateData.teamId = teamId;
  
  const user = userStore.update(req.params.id, updateData);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
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