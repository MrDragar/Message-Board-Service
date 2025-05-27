import sequelize from "sequelize";

import database from "./database.js";
import User from "./user.js";
import Category from "./category.js";

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
            values: ["in_moderation", "published", "archived", "rejected", "deleted" ]
        },
        authorId: {
            type: sequelize.INTEGER,
            references: {
                model: User,
                key: 'id',       
            }
        },
        categoryId: {
            type: sequelize.INTEGER,
            references: {
                model: Category,
                key: "id"
            }
        }
    },
);

export default Advertisement;