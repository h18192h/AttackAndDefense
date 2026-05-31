import { Router } from 'express';
import { announcementStore, teamStore } from '../data/database';

const router = Router();

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const teamId = req.query.teamId as string | undefined;
  const announcements = announcementStore.getRecent(limit, teamId);
  res.json({ success: true, data: announcements });
});

router.get('/all', (req, res) => {
  const announcements = announcementStore.getAll();
  res.json({ success: true, data: announcements });
});

router.get('/public', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 15;
  const announcements = announcementStore.getAllTeams(limit);
  res.json({ success: true, data: announcements });
});

router.post('/', (req, res) => {
  try {
    const { title, content, type, teamIds } = req.body;
    
    if (!title || !content || !type) {
      return res.json({ success: false, message: '缺少必填字段' });
    }

    if (!['system', 'score', 'warning'].includes(type)) {
      return res.json({ success: false, message: '无效的公告类型' });
    }

    let teamNames: string[] | undefined;
    if (teamIds && teamIds.length > 0) {
      const teams = teamStore.getAll();
      teamNames = teamIds.map((teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        return team?.name || '未知队伍';
      });
    }

    const announcement = announcementStore.create(title, content, type as 'system' | 'score' | 'warning', teamIds, teamNames);
    res.json({ success: true, data: announcement });
  } catch (err) {
    console.error('创建公告失败:', err);
    res.json({ success: false, message: '创建公告失败: ' + (err as Error).message });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const success = announcementStore.delete(id);
  res.json({ success, message: success ? '删除成功' : '删除失败' });
});

export default router;