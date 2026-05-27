import express from 'express';
import { scoreStore, teamStore } from '../data/store';
import { TeamScore } from '../types';

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
  const rankings: TeamScore[] = teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    totalPoints: scoreStore.getTeamTotalScore(team.id),
  })).sort((a, b) => b.totalPoints - a.totalPoints);
  
  res.json({ success: true, data: rankings });
});

router.post('/', (req, res) => {
  const { teamId, points, description } = req.body;
  if (!teamId || points === undefined || !description) {
    return res.status(400).json({ success: false, message: '队伍ID、分数和描述不能为空' });
  }
  if (!teamStore.getById(teamId)) {
    return res.status(404).json({ success: false, message: '队伍不存在' });
  }
  const score = scoreStore.create(teamId, points, description);
  res.json({ success: true, data: score });
});

router.delete('/:id', (req, res) => {
  const success = scoreStore.delete(req.params.id);
  if (success) {
    res.json({ success: true, message: '删除成功' });
  } else {
    res.status(404).json({ success: false, message: '记录不存在' });
  }
});

export default router;