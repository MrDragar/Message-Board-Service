import database from './database.js';
import User from './user.js';
import Advertisement from './advertisement.js';
import Category from './category.js';
import Comment from './comment.js';
import Moderator from './moderator.js';
import GuideField from './guide_field.js';
import GuideValue from './guide_value.js';

// Define associations
Advertisement.belongsTo(User, { foreignKey: 'authorId' });
User.hasMany(Advertisement, { foreignKey: 'authorId' });

Comment.belongsTo(User, { foreignKey: 'authorId' });
User.hasMany(Comment, { foreignKey: 'authorId' });

Comment.belongsTo(Advertisement, { foreignKey: 'advertisementId' });
Advertisement.hasMany(Comment, { foreignKey: 'advertisementId' });

Advertisement.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Advertisement, { foreignKey: 'categoryId' });

Category.belongsToMany(GuideField, { through: 'Category_GuideField', foreignKey: 'categoryId' });
GuideField.belongsToMany(Category, { through: 'Category_GuideField', foreignKey: 'guideFieldId' });

GuideValue.belongsTo(GuideField, { foreignKey: 'guideFieldId' });
GuideField.hasMany(GuideValue, { foreignKey: 'guideFieldId' });

Advertisement.belongsToMany(GuideValue, { through: 'Advertisement_GuideValue', foreignKey: 'advertisementId' });
GuideValue.belongsToMany(Advertisement, { through: 'Advertisement_GuideValue', foreignKey: 'guideValueId' });

// Sync database
database.sync({ force: false }).then(() => {
  console.log('Database synced successfully');
}).catch(err => {
  console.error('Error syncing database:', err);
});

export { User, Advertisement, Category, Comment, Moderator, GuideField, GuideValue };