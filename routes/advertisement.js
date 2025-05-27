import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { Advertisement, Comment, User, Category, GuideValue, GuideField } from '../models/index.js';

const router = Router();

/* GET advertisement by ID */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['login'] },
        { model: Category },
        {
          model: GuideValue,
          include: [{ model: GuideField, attributes: ['name'] }],
        },
        {
          model: Comment,
          include: [{ model: User, attributes: ['login'] }],
        },
      ],
    });
    if (!advertisement) {
      return res.status(404).render('error', { message: 'Объявление не найдено' });
    }
    res.render('advertisement', {
      title: advertisement.title,
      advertisement,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

/* POST archive advertisement */
router.post('/archive/:id', authMiddleware, async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    if (req.user.id !== advertisement.authorId && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Нет прав для архивирования' });
    }
    advertisement.status = 'archived';
    await advertisement.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST add comment */
router.post('/:id/comment', [
  authMiddleware,
  check('content', 'Комментарий не должен быть пустым').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  const advertisement = await Advertisement.findByPk(req.params.id, {
    include: [
      { model: User, attributes: ['login'] },
      { model: Category },
      {
        model: GuideValue,
        include: [{ model: GuideField, attributes: ['name'] }],
      },
      {
        model: Comment,
        include: [{ model: User, attributes: ['login'] }],
      },
    ],
  });

  if (!advertisement) {
    return res.status(404).render('error', { message: 'Объявление не найдено' });
  }

  if (advertisement.status !== 'published') {
    return res.render('advertisement', {
      title: advertisement.title,
      advertisement,
      user: req.user,
      comment_error: [{ msg: 'Комментарии разрешены только для опубликованных объявлений' }],
    });
  }

  if (!errors.isEmpty()) {
    return res.render('advertisement', {
      title: advertisement.title,
      advertisement,
      user: req.user,
      comment_error: errors.array(),
    });
  }

  try {
    await Comment.create({
      content: req.body.content,
      authorId: req.user.id,
      advertisementId: req.params.id,
    });
    res.redirect(`/advertisement/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

/* POST delete comment */
router.post('/comment/delete/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id, {
      include: [{ model: Advertisement }],
    });
    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }
    if (req.user.id !== comment.advertisement.authorId && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Нет прав для удаления' });
    }
    await comment.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;