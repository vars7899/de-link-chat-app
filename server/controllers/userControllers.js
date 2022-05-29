const asyncHandler = require("express-async-handler");
const generateToken = require("../token.js");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// @desc		Register new user
// @route		/api/users
// @access		Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  //   ? check for missing fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the required fields");
  }
  //   ? Check if the email is already registered
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("Email is already registered");
  }
  //   ? create new user in the database
  const newUser = await User.create({
    name,
    email,
    password,
    image: pic,
  });
  //   ? response
  if (newUser) {
    res.status(200).json({
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
      },
      message: "User registered successfully",
      token: generateToken(newUser._id),
    });
  } else {
    res.status(500);
    throw new Error("Server could not process the request");
  }
});

// @desc		Login existing user
// @route		/api/users/login
// @access		Public
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExist = await User.findOne({ email });

    if (userExist && (await userExist.matchPassword(password))) {
      res.status(200).json({
        user: userExist,
        message: "user successfully logged in",
        token: generateToken(userExist._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid email or password");
    }
  } catch (err) {
    res.status(500);
    throw new Error(err);
  }
});

// @desc			Get a certain user
// @route			GET /api/users?search=
// @access		Private
const allUsers = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    const allUserData = await User.find(keyword).find({
      _id: { $ne: req.user._id },
    });
    if (allUserData.length === 0) {
      res.status(200).json({
        message: "No user Exist",
      });
    }
    res.status(200).json({
      users: allUserData,
    });
  } catch (err) {
    res.status(500);
    throw new Error(err);
  }
});

module.exports = { registerUser, loginUser, allUsers };
