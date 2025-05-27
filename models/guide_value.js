import sequelize from "sequelize";

import database from "./database.js";
import GuideField from "./guide_field.js";

const GuideValue = database.define(
    "guide_value", {
        id: { 
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        value: {
            type: sequelize.STRING,
            allowNull: false
       },
       guideFieldId: {
            type: sequelize.INTEGER,
            references: {
                model: GuideField,
                key: "id"
            }   
       }
    }
);

export default GuideValue;