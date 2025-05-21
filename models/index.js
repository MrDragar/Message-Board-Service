import database from "./database.js"
import User from "./user.js";
import Advertisement from "./advertisement.js";

Advertisement.belongsTo(User, {foreignKey: 'authorId'});
User.hasMany(User, {foreignKey: 'authorId'});


database.sync({force: true}).then(result=>{
    console.log(result);
}).catch(err=> console.log(err));

export { User, Advertisement };