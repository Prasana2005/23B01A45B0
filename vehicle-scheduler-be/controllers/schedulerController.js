const { getDepots, getVehicles } = require("../services/apiService");
const solveKnapsack = require("../utils/knapsack");
const logger = require("../utils/logger");

const getSchedule = async (req, res) => {
    try {
        logger.info("Fetching depots and vehicles");

        const depotResponse = await getDepots();
        const vehicleResponse = await getVehicles();

        const depots = depotResponse.depots;
        const vehicles = vehicleResponse.vehicles;

        const schedules = depots.map((depot) => {

    const selectedTasks = solveKnapsack(
        vehicles,
        depot.MechanicHours
    );

    const totalDuration = selectedTasks.reduce(
        (sum, task) => sum + task.Duration,
        0
    );

    const totalImpact = selectedTasks.reduce(
        (sum, task) => sum + task.Impact,
        0
    );

    return {
        depotId: depot.ID,
        mechanicHours: depot.MechanicHours,
        totalDuration,
        totalImpact,
        selectedTasks
    };

});

        logger.info("Schedule generated successfully");

        res.status(200).json({
            schedules
        });

    } catch (err) {
        logger.error(err.message);

        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    getSchedule
};