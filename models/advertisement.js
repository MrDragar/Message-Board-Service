import sequelize from "sequelize";

import database from "./database.js";
import User from "./user.js";

const Advertisement = database.define(
    "advertisement", {
        id: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        title: {
            type: sequelize.STRING,
            allowNull: false
        },
        status: {
            type: sequelize.ENUM,
            values: ["in_moderation", "published", "archived", "rejected" ]
        },
        authorId: {
            type: sequelize.INTEGER,
            references: {
                model: User,
                key: 'id',       
            }
        }
    },
);

export default Advertisement;