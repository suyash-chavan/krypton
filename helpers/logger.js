const log4js = require("log4js");

log4js.configure({
    appenders: {
        init: { type: "file", filename: "./logs/init.log" },
        create: { type: "file", filename: "./logs/create.log" },
        enroll: { type: "file", filename: "./logs/enroll.log" },
        submit: { type: "file", filename: "./logs/submit.log" },
        view: { type: "file", filename: "./logs/view.log" },
    },
    categories: { 
        default: { appenders: ["init", "create", "enroll", "submit", "view"], level: "error" } 
    }
});

module.exports = { log4js }