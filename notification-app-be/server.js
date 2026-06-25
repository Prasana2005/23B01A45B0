const express = require("express");
const notificationRoutes = require("./routes/notification");

const app = express();

app.use(express.json());

app.use("/notifications", notificationRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});