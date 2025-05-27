import sequelize from "sequelize";

import database from "./database.js";
import User from "./user.js";
import Advertisement from "./advertisement.js";

const Comment = database.define(
    "comment", {
        id: { 
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        content: {
            type: sequelize.STRING,
            allowNull: false
        },
       publishTime: {
            type: sequelize.TIME,
            defaultValue: sequelize.NOW
       },
       authorId: {
            type: sequelize.INTEGER,
            references: {
                model: User,
                key: "id",       
            }
        },
        advertisementId: {
            type: sequelize.INTEGER,
            references: {
                model: Advertisement,
                key: "id"
            }
        }
    }
);

export default Comment;