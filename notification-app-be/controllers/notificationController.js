const { fetchNotifications } = require("../services/apiService");
const logger = require("../utils/logger");

const getNotifications = async (req, res) => {
    try {
        logger.info("Fetching notifications");

        const data = await fetchNotifications();

        res.status(200).json(data);

    } catch (err) {
        logger.error(err.message);

        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    getNotifications
};