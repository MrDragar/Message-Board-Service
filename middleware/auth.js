import pkg from 'jsonwebtoken';
const { verify } = pkg;
import config from '../config.js';
import { User } from '../models/index.js';

export  async function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  
  if (!token) {
    return next();
  }

  try {
    const decoded = verify(token, config.jwtSecret);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || user.isBanned) {
      res.clearCookie('token');
      return next();
    }

    req.user = user;
    res.locals.user = user; 
    next();
  } catch (e) {
    res.clearCookie('token');
    next();
  }
};

export function checkRole(roles) {
    return function(req, res, next) {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Нет доступа' });
      }
      next();
    };
  };