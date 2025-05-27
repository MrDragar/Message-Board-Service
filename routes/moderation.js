import { Router } from 'express';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { Advertisement, User, Category, GuideValue } from '../models/index.js';
import { Moderator } from '../models/index.js';

const router = Router();

/* GET moderation panel */
router.get('', [authMiddleware, checkRole(['moderator'])], async (req, res) => {
  try {
    const advertisements = await Advertisement.findAll({
      where: { status: 'in_moderation' },
      include: [
        { model: User, attributes: ['login'] },
        { model: Category },
        { model: GuideValue }
      ],
    });
    const nonBannedUsers = await User.findAll({
      where: { role: 'user', isBanned: false },
      attributes: ['id', 'login'],
    });
    const bannedUsers = await User.findAll({
      where: { role: 'user', isBanned: true },
      attributes: ['id', 'login'],
    });
    console.log('Non-banned users:', nonBannedUsers.length, 'Banned users:', bannedUsers.length); // Debug log
    res.render('moderation', {
      title: 'Панель модерации',
      user: req.user,
      advertisements,
      nonBannedUsers,
      bannedUsers,
    });
  } catch (error) {
    console.error('Error fetching moderation data:', error);
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

/* POST publish advertisement */
router.post('/publish/:id', [authMiddleware, checkRole(['moderator'])], async (req, res) => {
  try {
    const result = await Moderator.premoderateAd(true, req.params.id);
    if (result === 1) {
      return res.status(400).json({ message: 'Объявление не найдено или не на модерации' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error publishing ad:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST reject advertisement */
router.post('/reject/:id', [authMiddleware, checkRole(['moderator'])], async (req, res) => {
  try {
    const result = await Moderator.premoderateAd(false, req.params.id);
    if (result === 1) {
      return res.status(400).json({ message: 'Объявление не найдено или не на модерации' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting ad:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST archive advertisement */
router.post('/archive/:id', [authMiddleware, checkRole(['moderator'])], async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    advertisement.status = 'archived';
    await advertisement.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error archiving ad:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST ban user */
router.post('/ban-user/:userId', [authMiddleware, checkRole(['moderator'])], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user || user.role !== 'user') {
      return res.status(400).json({ message: 'Пользователь не найден или не может быть заблокирован' });
    }
    user.isBanned = true;
    await user.save();
    console.log(`User ${user.login} banned`); // Debug log
    res.json({ success: true });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST unban user */
router.post('/unban-user/:userId', [authMiddleware, checkRole(['moderator'])], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user || !user.isBanned) {
      return res.status(400).json({ message: 'Пользователь не найден или не заблокирован' });
    }
    user.isBanned = false;
    await user.save();
    console.log(`User ${user.login} unbanned`); // Debug log
    res.json({ success: true });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST delete advertisement */
router.post('/delete-ad/:id', [authMiddleware, checkRole(['moderator'])], async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    await advertisement.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;