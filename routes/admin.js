import { Router } from 'express';
import { body, check, validationResult } from 'express-validator';
const router = Router();

import { checkRole, authMiddleware } from "../middleware/auth.js";
import GuideField from '../models/guide_field.js';
import GuideValue from '../models/guide_value.js';

router.get('', [authMiddleware, checkRole(['admin'])], async (req, res) => {
   res.render('admin', { 
      title: 'Админ-панель',
      user: req.user,
      guide_fields: await GuideField.findAll({include: GuideValue})
  });
});

router.post("/add-guide-field", [
  authMiddleware, 
  checkRole(['admin']),
  check('field_name', 'Название поля не должно быть пустым').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      guide_field_error: errors.array(),
      field_name: req.body.field_name,
      guide_fields: await GuideField.findAll({include: GuideValue})
    })
  }

  try {
    const {field_name} = req.body;
    const candidate = await GuideField.findOne({ where: { name: field_name } });
    if (candidate) {
      return res.render('admin', {
        title: 'Админ-панель',
        user: req.user,
        guide_field_error: [{ msg: 'Данное поле существует' }],
        field_name: req.body.field_name,
        guide_fields: await GuideField.findAll({include: GuideValue})
    });}
    let newField = await GuideField.create({name: field_name});
    await newField.save();
    res.render('admin', { 
        title: 'Админ-панель',
        user: req.user,
        guide_fields: await GuideField.findAll({include: GuideValue})
    });

  } catch (error) {
    console.log(error);
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      guide_field_error: [{ msg: 'Ошибка на стороне сервера' }],
      field_name: req.body.field_name,
      guide_fields: await GuideField.findAll({include: GuideValue})
    });
  }
});

 router.post("/add-guide-value", [
  authMiddleware, 
  checkRole(['admin']),
  check('field_value', 'Новое значение не должно быть пустым').notEmpty(),
  check('guide_field', 'Выберите название поля').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      guide_value_error: errors.array(),
      guide_field: req.body.guide_field,
      field_value: req.body.field_value,
      guide_fields: await GuideField.findAll({include: GuideValue})
    })
  }

  try {
    const {guide_field, field_value} = req.body;
    const candidate = await GuideValue.findOne({ where: { value: field_value,  guideFieldId: guide_field }});
    if (candidate) {
      return res.render('admin', {
        title: 'Админ-панель',
        user: req.user,
        guide_value_error: [{ msg: 'Данное значение уже существует' }],
        guide_field,
        field_value,
        guide_fields: await GuideField.findAll({include: GuideValue})
    })}
    let newValue = await GuideValue.create({ value: field_value,  guideFieldId: guide_field });
    await newValue.save();
    res.render('admin', { 
        title: 'Админ-панель',
        user: req.user,
        guide_fields: await GuideField.findAll({include: GuideValue})
    });

  } catch (error) {
    console.log(error);
    return res.render('admin', {
      title: 'Админ-панель',
      user: req.user,
      guide_value_error: [{ msg: 'Ошибка на стороне сервера' }],
      guide_fields: await GuideField.findAll({include: GuideValue}),
      guide_field: req.body.guide_field,
      field_value: req.body.field_value
    })
  }
}); 
export default router;