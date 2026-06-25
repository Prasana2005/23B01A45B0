const axios = require("axios");
require("dotenv").config();

const apiClient = axios.create({
    baseURL: process.env.BASE_URL,
    headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json"
    }
});

const fetchNotifications = async () => {
    const response = await apiClient.get("/notifications");
    return response.data;
};

module.exports = {
    fetchNotifications
};