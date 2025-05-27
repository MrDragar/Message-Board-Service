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
        field_name,
        users: await User.findAll(),
        categories: await Category.findAll({ include: [GuideField] }),
        guide_fields: await GuideField.findAll({ include: GuideValue }),
      });
    }
    await GuideField.create({ name: field_name });
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

/* POST edit guide field */
router.post('/edit-guide-field/:id', [
  authMiddleware,
  checkRole(['admin']),
  check('field_name', 'Название поля не должно быть пустым').notEmpty(),
], async (req, res) => {
  try {
    const guideField = await GuideField.findByPk(req.params.id);
    if (!guideField) {
      return res.status(404).json({ message: 'Поле справочника не найдено' });
    }
    const { field_name } = req.body;
    const candidate = await GuideField.findOne({ where: { name: field_name } });
    if (candidate && candidate.id !== guideField.id) {
      return res.status(400).json({ message: 'Поле с таким именем уже существует' });
    }
    guideField.name = field_name;
    await guideField.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST delete guide field */
router.post('/delete-guide-field/:id', [authMiddleware, checkRole(['admin'])], async (req, res) => {
  try {
    const guideField = await GuideField.findByPk(req.params.id);
    if (!guideField) {
      return res.status(404).json({ message: 'Поле справочника не найдено' });
    }
    await guideField.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
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
    res.status(500).render('error', { message: 'Ошибка сервера', error });
  }
});

/* POST edit guide value */
router.post('/edit-guide-value/:id', [
  authMiddleware,
  checkRole(['admin']),
  check('field_value', 'Значение не должно быть пустым').notEmpty(),
  check('guide_field', 'Выберите поле справочника').notEmpty(),
], async (req, res) => {
  try {
    const guideValue = await GuideValue.findByPk(req.params.id);
    if (!guideValue) {
      return res.status(404).json({ message: 'Значение справочника не найдено' });
    }
    const { field_value, guide_field } = req.body;
    const candidate = await GuideValue.findOne({ where: { value: field_value, guideFieldId: guide_field } });
    if (candidate && candidate.id !== guideValue.id) {
      return res.status(400).json({ message: 'Значение уже существует' });
    }
    guideValue.value = field_value;
    guideValue.guideFieldId = guide_field;
    await guideValue.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST delete guide value */
router.post('/delete-guide-value/:id', [authMiddleware, checkRole(['admin'])], async (req, res) => {
  try {
    const guideValue = await GuideValue.findByPk(req.params.id);
    if (!guideValue) {
      return res.status(404).json({ message: 'Значение справочника не найдено' });
    }
    await guideValue.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
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

router.post('/unban-user/:userId', [authMiddleware, checkRole(['admin'])], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user || user.role !== 'user') {
      return res.status(400).json({ message: 'Нельзя разблокировать этого пользователя' });
    }
    await user.unban();
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
      const guideFieldIds = Array.isArray(guide_fields) ? guide_fields : [guide_fields];
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

/* POST edit category */
router.post('/edit-category/:id', [
  authMiddleware,
  checkRole(['admin']),
  check('category_name', 'Название категории не должно быть пустым').notEmpty(),
], async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    const { category_name, guide_fields } = req.body;
    const candidate = await Category.findOne({ where: { name: category_name } });
    if (candidate && candidate.id !== category.id) {
      return res.status(400).json({ message: 'Категория с таким именем уже существует' });
    }
    category.name = category_name;
    await category.save();
    if (guide_fields) {
      const guideFieldIds = Array.isArray(guide_fields) ? guide_fields : [guide_fields];
      const guideFields = await GuideField.findAll({ where: { id: guideFieldIds } });
      await category.setGuide_fields(guideFields);
    } else {
      await category.setGuide_fields([]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/* POST delete category */
router.post('/delete-category/:id', [authMiddleware, checkRole(['admin'])], async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    await category.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;