const axios = require("axios");
require("dotenv").config();

const log = async (level, message) => {
    try {
        await axios.post(
            `${process.env.BASE_URL}/logs`,
            {
                stack: "backend",
                level,
                package: "handler",
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (err) {
        // Ignore logging failures so the application continues to run
    }
};

module.exports = {
    info: (message) => log("info", message),
    error: (message) => log("error", message)
};