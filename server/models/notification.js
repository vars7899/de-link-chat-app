const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
