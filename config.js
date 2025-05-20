const config = Object.freeze({
    database: process.env.database,
    login: process.env.login,
    password: process.env.password,
    dialect: "mysql",
    host: process.env.host
});

export default config;