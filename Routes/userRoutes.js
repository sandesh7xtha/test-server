const express = require("express");
const router = express.Router();
const User = require("../Models/userModels");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";
const SALT_ROUND = 10;

router.post("/signup", async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  console.log(req.body);
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(30).required(),
      confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
    }).messages({
      "string.min": "Password should be at least 8 characters",
      "any.only": "Passwords do not match",
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map((detail) => detail.message);
      return res.status(422).json({ message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    console.log(user);
    const token = jwt.sign({ userId: user._id }, SECRET_KEY);

    res.status(200).json({
      status: "ok",
      data: { token },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  let { email, password } = req.body;
  email = email.toLowerCase();
  let currentuser = "";

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).send({
        message: "Invalid Email !",
      });
    }

    const compairpassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!compairpassword) {
      res.status(400).send({
        message: "Invalid Password !",
      });
      return;
    }

    let { id, name } = existingUser;
    let expHour = "10";
    console.log(expHour);
    let token = jwt.sign(
      {
        id,
        email,
        name,
      },
      SECRET_KEY
      // { expiresIn: "10h" }
    );
    res.status(200).json({
      token,
      name,
      id,
    });
  } catch (err) {
    return res.json({
      message: err,
    });
  }
});

router.get("/allusers", async (req, res, next) => {
  // Handler function for the "/allusers" GET route
  try {
    // Attempt to retrieve all users from the database
    const users = await User.find({}, { name: 1, email: 1, _id: 1 });
    // Return the retrieved users as a JSON response
    return res.json(users);
  } catch (ex) {
    // If an error occurs, pass it on to the error-handling middleware
    // next(ex);
  }
});

router.get("/allusers/:id", async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "name",

      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
});

// router.get("/allusers", async (req, res, next) => {
//   // Handler function for the "/allusers" GET route
//   try {
//     // Attempt to retrieve all users from the database
//     const users = await User.find({});
//     // Return the retrieved users as a JSON response
//     return res.json(users);
//   } catch (ex) {
//     // If an error occurs, pass it on to the error-handling middleware
//     // next(ex);
//   }
// });

module.exports = router;
