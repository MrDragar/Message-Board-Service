import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import { Advertisement, Category, GuideField, GuideValue } from '../models/index.js';

const router = Router();

/* GET profile page */
router.get('/', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  try {
    const advertisements = await Advertisement.findAll({
      where: { authorId: req.user.id },
      include: [
        { model: Category, include: [{ model: GuideField, include: [GuideValue] }] },
        { model: GuideValue },
      ],
    });
    const categories = await Category.findAll({ include: [GuideField] });
    const guideFields = await GuideField.findAll({ include: [GuideValue] });
    res.render('profile', {
      title: 'Личный кабинет',
      user: req.user,
      advertisements,
      categories,
      guideFields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

/* GET guide values for a category */
router.get('/guide-values/:categoryId', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.categoryId, {
      include: [{ model: GuideField, include: [GuideValue] }],
    });
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    res.json(category.guide_fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST create advertisement */
router.post('/create-ad', [
  authMiddleware,
  check('title', 'Заголовок обязателен').notEmpty(),
  check('content', 'Текст обязателен').notEmpty(),
  check('category', 'Выберите категорию').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const categories = await Category.findAll({ include: [GuideField] });
    const guideFields = await GuideField.findAll({ include: [GuideValue] });
    return res.render('profile', {
      title: 'Личный кабинет',
      user: req.user,
      errors: errors.array(),
      advertisements: await Advertisement.findAll({
        where: { authorId: req.user.id },
        include: [{ model: Category, include: [{ model: GuideField, include: [GuideValue] }] }],
      }),
      categories,
      guideFields,
      title_value: req.body.title,
      content: req.body.content,
      category: req.body.category,
    });
  }

  try {
    const { title, content, category, guideValues } = req.body;
    const advertisement = await Advertisement.create({
      title,
      content,
      status: 'in_moderation',
      authorId: req.user.id,
      categoryId: category,
    });
    if (guideValues) {
      const guideValueIds = Array.isArray(guideValues) ? guideValues : [guideValues];
      const guideValuesRecords = await GuideValue.findAll({
        where: { id: guideValueIds }
      });
      if (guideValuesRecords.length !== guideValueIds.length) {
        return res.render('profile', {
          title: 'Личный кабинет',
          user: req.user,
          errors: [{ msg: 'Некоторые значения справочника не найдены' }],
          advertisements: await Advertisement.findAll({
            where: { authorId: req.user.id },
            include: [{ model: Category, include: [{ model: GuideField, include: [GuideValue] }] }],
          }),
          categories: await Category.findAll({ include: [GuideField] }),
          guideFields: await GuideField.findAll({ include: [GuideValue] }),
          title_value: req.body.title,
          content: req.body.content,
          category: req.body.category,
        });
      }
      await advertisement.setGuide_values(guideValuesRecords);
    }
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

export default router;