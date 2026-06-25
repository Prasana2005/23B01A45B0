const express = require("express");
const router = express.Router();

const { getSchedule } = require("../controllers/schedulerController");

router.get("/", getSchedule);

module.exports = router;