import sequelize from "sequelize";

import database from "./database.js";


const User = database.define(
    "user", {
        id: {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        login: {
            type: sequelize.STRING,
            allowNull: false
        },
        password: {
            type: sequelize.STRING,
            allowNull: false
        },
        email: {
            type: sequelize.STRING,
            allowNull: false
        },
        role: {
            type: sequelize.ENUM,
            defaultValue: "user",
            values: ["user", "admin", "moderator"]
        },
        isBanned: {
            type: sequelize.BOOLEAN,
            defaultValue: false
        }
    }
);

User.prototype.ban = async function() {
    this.isBanned = true;
    return await this.save();
}

User.prototype.unban = async function() {
    this.isBanned = false;
    return await this.save();
}

User.prototype.updateRole = async function(newRole) {
    this.role = newRole;
    return await this.save();
}

export default User;