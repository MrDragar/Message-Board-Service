const config = Object.freeze({
    database: process.env.DATABASE,
    login: process.env.LOGIN,
    password: process.env.PASSWORD,
    dialect: "mysql",
    host: process.env.HOST,
    jwtSecret: '1232454657687654', 
});

export default config;