import sequelize from "sequelize";

import database from "./database";


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
            type: sequelize.STRING,
            defaultValue: "user"
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

database.sync({force: true}).then(result=>{
    console.log(result);
}).catch(err=> console.log(err));


export default User;