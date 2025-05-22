import { Sequelize } from "sequelize";
import config  from "../config.js";
console.log(config.database, config.login)
const sequelize = new Sequelize(config.database, config.login, config.password, {
    dialect: config.dialect, 
    host: config.host
});

export default sequelize;