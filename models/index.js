import database from "./database"
import User from "./user";
import Advertisement from "./advertisement";

Advertisement.belongsTo(User, {foreignKey: 'authorId'});
User.hasMany(User, {foreignKey: 'authorId'});


database.sync({force: true}).then(result=>{
    console.log(result);
}).catch(err=> console.log(err));

export { User, Advertisement };