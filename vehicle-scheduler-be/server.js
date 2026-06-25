const express = require("express");
const schedulerRoutes = require("./routes/scheduler");

const app = express();

app.use(express.json());

app.use("/schedule", schedulerRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});