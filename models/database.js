import { Sequelize } from "sequelize";
import config  from "../config";

const sequelize = new Sequelize(config.database, config.login, config.password, {
    dialect: config.dialect, 
    host: config.host
});

export default sequelize;