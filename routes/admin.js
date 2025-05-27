import { Router } from 'express';
import { body, check, validationResult } from 'express-validator';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { User, GuideField, GuideValue, Category } from '../models/index.js';

const router = Router();

/* GET admin panel */
router.get('', [authMiddleware, checkRole(['admin'])], async (req, res) => {
  try {
    const users = await User.findAll();
    const categories = await Category.findAll({ include: [GuideField] });
    const guide_fields = await GuideField.findAll({ include: GuideValue });
    res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      users,
      categories,
      guide_fields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

/* POST add guide field */
router.post('/add-guide-field', [
  authMiddleware,
  checkRole(['admin']),
  check('field_name', 'Название поля не должно быть пустым').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      guide_field_error: errors.array(),
      field_name: req.body.field_name,
      users: await User.findAll(),
      categories: await Category.findAll({ include: [GuideField] }),
      guide_fields: await GuideField.findAll({ include: GuideValue }),
    });
  }

  try {
    const { field_name } = req.body;
    const candidate = await GuideField.findOne({ where: { name: field_name } });
    if (candidate) {
      return res.render('admin', {
        title: 'Админ-панель',
        user: req.user,
        guide_field_error: [{ msg: 'Данное поле существует' }],
        field_name: req.body.field_name,
        users: await User.findAll(),
        categories: await Category.findAll({ include: [GuideField] }),
        guide_fields: await GuideField.findAll({ include: GuideValue }),
      });
    }
    await GuideField.create({ name: field_name });
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      guide_field_error: [{ msg: 'Ошибка на стороне сервера' }],
      field_name: req.body.field_name,
      users: await User.findAll(),
      categories: await Category.findAll({ include: [GuideField] }),
      guide_fields: await GuideField.findAll({ include: GuideValue }),
    });
  }
});

/* POST add guide value */
router.post('/add-guide-value', [
  authMiddleware,
  checkRole(['admin']),
  check('field_value', 'Новое значение не должно быть пустым').notEmpty(),
  check('guide_field', 'Выберите название поля').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      guide_value_error: errors.array(),
      guide_field: req.body.guide_field,
      field_value: req.body.field_value,
      users: await User.findAll(),
      categories: await Category.findAll({ include: [GuideField] }),
      guide_fields: await GuideField.findAll({ include: GuideValue }),
    });
  }

  try {
    const { guide_field, field_value } = req.body;
    const candidate = await GuideValue.findOne({ where: { value: field_value, guideFieldId: guide_field } });
    if (candidate) {
      return res.render('admin', {
        title: 'Админ-панель',
        user: req.user,
        guide_value_error: [{ msg: 'Данное значение уже существует' }],
        guide_field,
        field_value,
        users: await User.findAll(),
        categories: await Category.findAll({ include: [GuideField] }),
        guide_fields: await GuideField.findAll({ include: GuideValue }),
      });
    }
    await GuideValue.create({ value: field_value, guideFieldId: guide_field });
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      guide_value_error: [{ msg: 'Ошибка на стороне сервера' }],
      guide_field: req.body.guide_field,
      field_value: req.body.field_value,
      users: await User.findAll(),
      categories: await Category.findAll({ include: [GuideField] }),
      guide_fields: await GuideField.findAll({ include: GuideValue }),
    });
  }
});

/* POST ban user */
router.post('/ban-user/:userId', [authMiddleware, checkRole(['admin'])], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user || user.role !== 'user') {
      return res.status(400).json({ message: 'Нельзя заблокировать этого пользователя' });
    }
    await user.ban();
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

/* POST change user role */
router.post('/change-role/:userId', [authMiddleware, checkRole(['admin'])], async (req, res) => {
  const { newRole } = req.body;
  if (!['user', 'moderator', 'admin'].includes(newRole)) {
    return res.status(400).json({ message: 'Недопустимая роль' });
  }
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    await user.updateRole(newRole);
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

/* POST add category */
router.post('/add-category', [
  authMiddleware,
  checkRole(['admin']),
  check('category_name', 'Название категории не должно быть пустым').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      category_error: errors.array(),
      category_name: req.body.category_name,
      users: await User.findAll(),
      categories: await Category.findAll({ include: [GuideField] }),
      guide_fields: await GuideField.findAll({ include: GuideValue }),
    });
  }

  try {
    const { category_name, guide_fields } = req.body;
    const candidate = await Category.findOne({ where: { name: category_name } });
    if (candidate) {
      return res.render('admin', {
        title: 'Админ-панель',
        user: req.user,
        category_error: [{ msg: 'Категория уже существует' }],
        category_name,
        users: await User.findAll(),
        categories: await Category.findAll({ include: [GuideField] }),
        guide_fields: await GuideField.findAll({ include: GuideValue }),
      });
    }
    const category = await Category.create({ name: category_name });
    if (guide_fields) {
      // Ensure guide_fields is an array
      const guideFieldIds = Array.isArray(guide_fields) ? guide_fields : [guide_fields];
      // Fetch guide fields to ensure they exist
      const guideFields = await GuideField.findAll({
        where: { id: guideFieldIds }
      });
      if (guideFields.length !== guideFieldIds.length) {
        return res.render('admin', {
          title: 'Админ-панель',
          user: req.user,
          category_error: [{ msg: 'Некоторые поля справочника не найдены' }],
          category_name,
          users: await User.findAll(),
          categories: await Category.findAll({ include: [GuideField] }),
          guide_fields: await GuideField.findAll({ include: GuideValue }),
        });
      }
      // Associate guide fields with the category
      await category.setGuide_fields(guideFields);
    }
    res.redirect('/admin');
  } catch (error) {
    console.error('Error adding category:', error);
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      category_error: [{ msg: 'Ошибка на стороне сервера: ' + error.message }],
      category_name: req.body.category_name,
      users: await User.findAll(),
      categories: await Category.findAll({ include: [GuideField] }),
      guide_fields: await GuideField.findAll({ include: GuideValue }),
    });
  }
});

export default router;