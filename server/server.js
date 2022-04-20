const express = require("express");
const colors = require("colors");
require("dotenv").config();
const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from server",
  });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    colors.brightMagenta(`\nServer is UP on PORT ${process.env.SERVER_PORT}`)
  );
  console.log(`Visit  ` + colors.underline.blue(`localhost:${5000}`));
});
