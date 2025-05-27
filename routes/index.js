import express from 'express';
import { Op } from 'sequelize';
import { Advertisement, Category, GuideValue, User, GuideField } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/* GET home page with all published advertisements */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, category, guideValues } = req.query;
    const advertisements = await Advertisement.findAll({
      where: { status: 'published' },
      include: [
        { model: User, attributes: ['login'] },
        {
          model: Category,
          include: [{ model: GuideField, include: [GuideValue] }],
        },
        {
          model: GuideValue,
          include: [{ model: GuideField, attributes: ['name'] }],
        },
      ],
    });

    const categories = await Category.findAll();
    const guideFields = await Category.findByPk(category, {
      include: [{ model: GuideField, include: [GuideValue] }],
    });

    res.render('index', {
      title: 'Доска объявлений',
      advertisements,
      categories,
      guideFields: guideFields ? guideFields.guide_fields : [],
      user: req.user,
      search,
      category,
      guideValues,
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

export default router;