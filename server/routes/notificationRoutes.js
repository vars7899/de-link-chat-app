const router = require("express").Router();
const {
  addNewNotification,
  deleteNotification,
  getNotification,
} = require("../controllers/notificationController");
const auth = require("../middleware/authMiddleware");

router.route("/").post(auth, addNewNotification).get(auth, getNotification);
router.route("/:notificationId").delete(auth, deleteNotification);

module.exports = router;
