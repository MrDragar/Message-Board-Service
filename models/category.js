import sequelize from "sequelize";

import database from "./database.js";

const Category = database.define(
    "category", {
        "id": { 
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        "name": {
            type: sequelize.STRING,
            unique: true,
            allowNull: false
        },
        "description": {
            type: sequelize.STRING
        }
    }
);

export default Category;