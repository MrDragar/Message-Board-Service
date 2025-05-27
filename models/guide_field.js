import sequelize from "sequelize";

import database from "./database.js";


const GuideField = database.define(
    "guide_field", {
        id: { 
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: sequelize.STRING,
            allowNull: false
       },
    }
);

export default GuideField;