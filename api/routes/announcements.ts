import { Router } from 'express';
import { announcementStore, teamStore } from '../data/database';

const router = Router();

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const announcements = announcementStore.getRecent(limit);
  res.json({ success: true, data: announcements });
});

router.get('/all', (req, res) => {
  const announcements = announcementStore.getAll();
  res.json({ success: true, data: announcements });
});

router.post('/', (req, res) => {
  const { title, content, type, teamId } = req.body;
  
  if (!title || !content || !type) {
    return res.json({ success: false, message: '缺少必填字段' });
  }

  if (!['system', 'score', 'warning'].includes(type)) {
    return res.json({ success: false, message: '无效的公告类型' });
  }

  let teamName: string | undefined;
  if (teamId) {
    const team = teamStore.getById(teamId);
    if (!team) {
      return res.json({ success: false, message: '队伍不存在' });
    }
    teamName = team.name;
  }

  const announcement = announcementStore.create(title, content, type as 'system' | 'score' | 'warning', teamId, teamName);
  res.json({ success: true, data: announcement });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const success = announcementStore.delete(id);
  res.json({ success, message: success ? '删除成功' : '删除失败' });
});

export default router;