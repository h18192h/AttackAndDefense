import express from 'express';
import { scoreStore, teamStore, announcementStore } from '../data/database';

const router = express.Router();

router.get('/', (req, res) => {
  const scores = scoreStore.getAll();
  res.json({ success: true, data: scores });
});

router.get('/team/:teamId', (req, res) => {
  const scores = scoreStore.getByTeamId(req.params.teamId);
  res.json({ success: true, data: scores });
});

router.get('/ranking', (req, res) => {
  const teams = teamStore.getAll();
  const rankings = teams.map(team => {
    const totalPoints = scoreStore.getTeamTotalScore(team.id);
    return {
      teamId: team.id,
      teamName: team.name,
      totalPoints,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);
  
  res.json({ success: true, data: rankings });
});

router.post('/', (req, res) => {
  const { teamId, points, description } = req.body;
  
  if (!teamId || points === undefined || points === null) {
    return res.status(400).json({ success: false, message: '队伍和分数不能为空' });
  }
  
  if (typeof points !== 'number') {
    return res.status(400).json({ success: false, message: '分数必须是数字' });
  }
  
  const team = teamStore.getById(teamId);
  if (!team) {
    return res.status(404).json({ success: false, message: '队伍不存在' });
  }
  
  const score = scoreStore.create(teamId, points, description || '');
  
  const title = points >= 0 ? '加分成功' : '扣分';
  const content = `${team.name}${points >= 0 ? '获得' : '扣除'}${Math.abs(points)}分${description ? ` - ${description}` : ''}`;
  announcementStore.create(title, content, 'score', [teamId], [team.name], points);
  
  res.json({ success: true, data: score });
});

router.delete('/:id', (req, res) => {
  const success = scoreStore.delete(req.params.id);
  if (success) {
    res.json({ success: true, message: '删除成功' });
  } else {
    res.status(404).json({ success: false, message: '分数记录不存在' });
  }
});

export default router;