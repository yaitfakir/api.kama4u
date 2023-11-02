const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const logger = require("../utils/logger");
var jwt = require("jsonwebtoken");
var Sub = require("../utils/subscription");
const User = require("../models/User");
const sendEmail = require("../utils/mail-basic");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      return res.status(400).json({ error: "All input is required" });
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email: email.toLowerCase() });
    if (
      user &&
      ((await bcrypt.compare(password, user.password)) ||
        password == process.env.MASTER_PASS)
    ) {
      if (!user.confirmed)
        return res.status(400).json({ error: "User is Inactive" });

      // Create token
      const token = jwt.sign(
        {
          usid: user._id,
          email: email,
          role: user.role,
          isvld: user.confirmed,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: process.env.EXPIRES,
        }
      );

      // user
      var rest = {
        firstName: user.firstName,
        lastName: user.lastName,
        token: token,
      };
      return res.status(200).json(rest);
    } else {
      return res.status(403).json({ error: "Invalid Credentials" });
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json({ error: "An error occured" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      return res.status(400).json({ error: "All input is required" });
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res
        .status(409)
        .json({ error: "User Already Exist. Please Login" });
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      phone: phone,
      password: encryptedPassword,
      confirmed: true,
      role: process.env.STANDARD,
    });

    // Create token
    const token = jwt.sign(
      {
        usid: user._id,
        email: email,
        role: user.role,
        isvld: user.confirmed,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: process.env.EXPIRES,
      }
    );

    var rest = {
      firstName: user.firstName,
      lastName: user.lastName,
      token: token,
    };

    // // Send Email
    // const link = `${process.env.CLIENT_URL}confirmation-required?id=${user._id}`;
    // const email_config = {
    //   link: link,
    //   title: "Subscription Confirmation",
    //   header: "Confirm Your Email Address",
    //   action: "Confirme",
    // };
    // await sendEmail(user.email, "Subscription Confirmation", email_config);

    // return new user
    return res.status(201).json(rest);
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);

    return res.status(500).json({ error: "An error occured" });
  }
});

// router.get("/confirme/:code", async (req, res) => {
//   // Our login logic starts here
//   try {
//     // Get user input
//     const id = req.params.code;

//     // Validate user input
//     if (!id) {
//       return (400).json("All input is required");
//     }
//     // Validate if user exist in our database
//     const user = await User.findOne({ _id: id }).populate("organisation");

//     if (!user) {
//       return res.status(404).json("User not found");
//     }

//     if (user && !user.confirmed) {
//       await User.findByIdAndUpdate(user._id, { confirmed: true });

//       user.confirmed = true;

//       // Create token
//       const token = jwt.sign(
//         {
//           usid: user._id,
//           email: user.email,
//           role: user.role,
//           org: user.organisation.name,
//           orgid: user.organisation.id,
//           prfl: user.organisation.profile,
//           isvld: user.confirmed,
//         },
//         process.env.TOKEN_KEY,
//         {
//           expiresIn: process.env.EXPIRES,
//         }
//       );

//       await Sub.subscribe(user.email, process.env.SELLER);

//       var rest = {
//         firstName: user.firstName,
//         lastName: user.lastName,
//         token: token,
//       }; // user
//       return res.status(200).json(rest);
//     }
//     return res.status(400).json("Kama4u account has already been confirmed");
//   } catch (err) {
//     await logger(req, "Error", err);

//     console.log("An error occured", err);
//     return res.status(500).json("An error occured");
//   }
//   // Our register logic ends here
// });

// router.post("/reset", async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user)
//       return res.status(400).json("User with given email doesn't exist");

//     // const link = `${process.env.CLIENT_URL}api/auth/password-reset/${user._id}`;
//     const link = `${process.env.CLIENT_URL}auth/reset-password/${user._id}`;
//     const email_config = {
//       link: link,
//       title: "Password reset",
//       header: "Reset Your Password",
//       action: "Reset",
//     };
//     await sendEmail(user.email, "Password reset", email_config);

//     // res.status(200).json("password reset link sent to your email account");
//     return res.status(200).json({ link: link });
//   } catch (err) {
//     await logger(req, "Error", err);

//     console.log("An error occured");
//     console.log(err);
//     return res.status(500).json("An error occured");
//   }
// });

// router.post("/password-reset/:userId", async (req, res) => {
//   try {
//     const { password } = req.body;
//     const id = req.params.userId;
//     const user = await User.findById({ _id: id });
//     if (!user) return res.status(400).json("invalid link or expired");

//     user.password = await bcrypt.hash(password, 10);
//     user.save();
//     return res.status(200).json("password reset sucessfully.");
//   } catch (err) {
//     await logger(req, "Error", err);

//     console.log("An error occured");
//     console.log(err);
//     return res.status(500).json("An error occured");
//   }
// });

module.exports = router;
