import createError from 'http-errors';
import express, { json, urlencoded, static as static_} from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import logger from 'morgan';
import { fileURLToPath } from 'url';  
import { dirname, join } from 'path'; 
import 'dotenv/config';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js';
import profileRouter from './routes/profile.js';
import advertisementRouter from './routes/advertisement.js';
import moderatorRouter from './routes/moderator.js';
import { User, Advertisement } from './models/index.js';
import { authMiddleware } from "./middleware/auth.js"
import config from './config.js'

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let app = express();

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(static_(join(__dirname, 'public')));
app.use(session({
  secret: config.jwtSecret, // Замените на свой секретный ключ
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Для HTTPS установите true
}));
app.use(authMiddleware);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/profile', profileRouter);
app.use('/advertisement', advertisementRouter);
app.use('/moderator', moderatorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
