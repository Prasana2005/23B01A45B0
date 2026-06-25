const axios = require("axios");
require("dotenv").config();

const apiClient = axios.create({
    baseURL: process.env.BASE_URL,
    timeout: 10000,
    headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json"
    }
});

const getDepots = async () => {
    const response = await apiClient.get("/depots");
    return response.data;
};

const getVehicles = async () => {
    const response = await apiClient.get("/vehicles");
    return response.data;
};

module.exports = {
    getDepots,
    getVehicles
};