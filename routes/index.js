import express from 'express';
import { Op } from 'sequelize';
import { Advertisement, Category, GuideValue, User, GuideField } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/* GET home page with published advertisements */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, category, guideValues } = req.query;
    const where = { status: 'published' };

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    if (category) {
      where.categoryId = category;
    }

    const advertisements = await Advertisement.findAll({
      where,
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

    let filteredAds = advertisements;
    if (guideValues) {
      const guideValueIds = Array.isArray(guideValues) ? guideValues : [guideValues];
      filteredAds = advertisements.filter(ad =>
        guideValueIds.every(id => ad.guide_values.some(gv => gv.id === parseInt(id)))
      );
    }

    const categories = await Category.findAll();
    const guideFields = await Category.findByPk(category, {
      include: [{ model: GuideField, include: [GuideValue] }],
    });

    res.render('index', {
      title: 'Доска объявлений',
      advertisements: filteredAds,
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

/* GET filtered advertisements */
router.get('/filter', authMiddleware, async (req, res) => {
  try {
    const { search, category, guideValues } = req.query;
    const where = { status: 'published' };

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    if (category) {
      where.categoryId = category;
    }

    const advertisements = await Advertisement.findAll({
      where,
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

    let filteredAds = advertisements;
    if (guideValues) {
      const guideValueIds = Array.isArray(guideValues) ? guideValues.map(id => parseInt(id)) : [parseInt(guideValues)];
      filteredAds = advertisements.filter(ad =>
        guideValueIds.every(id => ad.guide_values.some(gv => gv.id === id))
      );
    }

    res.json(filteredAds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;