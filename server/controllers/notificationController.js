const asyncHandler = require("express-async-handler");
const Notification = require("../models/notification");

const addNewNotification = asyncHandler(async (req, res) => {
  try {
    const { notification } = req.body;
    const alreadyExist = await Notification.findOne({
      notificationId: notification,
    });
    if (alreadyExist) return res.send("duplicates not allowed");
    console.log(req.body);
    var newNotification = await Notification.create({
      user: req.user._id,
      notificationId: notification,
    });
    newNotification = await newNotification.populate("user", "-password");
    newNotification = await newNotification.populate("notificationId");
    newNotification = await Notification.populate(newNotification, {
      path: "notificationId.sender",
      select: "name image email",
    });
    newNotification = await Notification.populate(newNotification, {
      path: "notificationId.chatId",
      select: "chatName isGroupChat latestMessage users",
    });
    newNotification = await Notification.populate(newNotification, {
      path: "notificationId.chatId.users",
      select: "name image email",
    });
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(500);
    throw new Error(err);
  }
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  try {
    var newNotification = await Notification.findOneAndDelete({
      chatId: notificationId,
    });
    res.status(202).json(newNotification);
  } catch (err) {
    res.status(500);
    throw new Error(err);
  }
});

const getNotification = asyncHandler(async (req, res) => {
  try {
    var notificationItem = await Notification.find({
      user: req.user._id,
    })
      .populate("user", "-password")
      .populate("notificationId");
    notificationItem = await Notification.populate(notificationItem, {
      path: "notificationId.sender",
      select: "name image email",
    });
    notificationItem = await Notification.populate(notificationItem, {
      path: "notificationId.chatId",
      select: "chatName isGroupChat latestMessage users",
    });
    notificationItem = await Notification.populate(notificationItem, {
      path: "notificationId.chatId.users",
      select: "name image email",
    });
    res.status(200).json(notificationItem);
  } catch (err) {
    res.status(500);
    throw new Error(err);
  }
});
module.exports = { addNewNotification, deleteNotification, getNotification };
