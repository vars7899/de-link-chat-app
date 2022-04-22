const express = require("express");
const colors = require("colors");
const dbConnect = require("./db.js");
require("dotenv").config();
const { errorHandler, routeNotFound } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");

dbConnect();
const app = express();
app.use(express.json());

// First route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from DE-Link Chat App server",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
// Error handling routes
app.use(routeNotFound);
app.use(errorHandler);

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    colors.brightMagenta(`\nServer is UP on PORT ${process.env.SERVER_PORT}`)
  );
  console.log(`Visit  ` + colors.underline.blue(`localhost:${5000}`));
});
