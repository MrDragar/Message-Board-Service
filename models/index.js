import database from "./database.js"
import User from "./user.js";
import Advertisement from "./advertisement.js";
import Category from "./category.js"
import Comment from "./comment.js"

Advertisement.belongsTo(User, {foreignKey: 'authorId'});
User.hasMany(User, {foreignKey: 'authorId'});

Comment.belongsTo(User, {foreignKey: "authorId"});
User.hasMany(Comment, {foreignKey: "authorId"});

Comment.belongsTo(Advertisement, {foreignKey: "advertisementId"});
Advertisement.hasMany(Comment, {foreignKey: "advertisementId"});

Advertisement.belongsTo(Category, {foreignKey: "categoryId"});
Category.hasMany(Advertisement, {foreignKey: "categoryId"});

database.sync({force: true}).then(result=>{
    console.log(result);
}).catch(err=> console.log(err));

export { User, Advertisement, Category};