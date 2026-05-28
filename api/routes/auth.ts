import express from 'express';
import { userStore } from '../data/database';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }
  
  const user = userStore.getByUsername(username) as any;
  
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, message: '登录成功', user: userWithoutPassword });
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: '退出成功' });
});

export default router;