import { Router } from 'express';
const router = Router();
import { check, validationResult } from 'express-validator';
import { hash, compare } from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { User } from '../models/index.js';
import config from '../config.js';

// Страница регистрации
router.get('/register', (req, res) => {
  res.render('auth/register.pug', { 
    title: 'Регистрация',
    login: '',
    email: ''
  });
});

// Обработка регистрации
router.post('/register', [
  check('login', 'Логин обязателен').notEmpty(),
  check('password', 'Пароль должен быть минимум 6 символов').isLength({ min: 6 }),
  check('confirmPassword', 'Пароли не совпадают').custom((value, { req }) => value === req.body.password),
  check('email', 'Некорректный email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.render('auth/register', {
      title: 'Регистрация',
      errors: errors.array(),
      login: req.body.login,
      email: req.body.email
    });
  }

  try {
    const { login, password, email } = req.body;

    const candidate = await User.findOne({ where: { login } });
    if (candidate) {
      return res.render('auth/register', {
        title: 'Регистрация',
        errors: [{ msg: 'Пользователь с таким логином уже существует' }],
        login: req.body.login,
        email: req.body.email
      });
    }

    const hashedPassword = await hash(password, 12);
    await User.create({ login, password: hashedPassword, email, role: 'user' });

    res.redirect('/auth/login');
  } catch (e) {
    res.render('auth/register', {
      title: 'Регистрация',
      errors: [{ msg: 'Ошибка при регистрации' }],
      login: req.body.login,
      email: req.body.email
    });
  }
});

// Страница входа
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Вход в систему',
    login: ''
  });
});

// Обработка входа
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await User.findOne({ where: { login } });
    if (!user) {
      return res.render('auth/login', {
        title: 'Вход в систему',
        login: req.body.login,
        error: 'Неверный логин или пароль'
      });
    }

    if (user.isBanned) {
      return res.render('auth/login', {
        title: 'Вход в систему',
        login: req.body.login,
        error: 'Ваш аккаунт заблокирован'
      });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Вход в систему',
        login: req.body.login,
        error: 'Неверный логин или пароль'
      });
    }

    const token = sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');
  } catch (e) {
    res.render('auth/login', {
      title: 'Вход в систему',
      login: req.body.login,
      error: 'Ошибка при авторизации'
    });
  }
});

// Выход
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

export default router;