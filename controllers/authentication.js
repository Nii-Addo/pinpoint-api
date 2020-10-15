const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwtDecode = require("jwt-decode");

require("dotenv").config();

const { createToken } = require("../config/jwt");
let User = require("../models/User");

/*Login handler*/
router.post("/login", async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      res.status(400).json({
        message: "Something went wrong",
      });
    }

    if (!user) {
      res.status(403).json({
        message: "Wrong email or password",
      });
    } else {
      req.login(user, (err) => {
        if (err) {
          res.status(403).json({
            message: "Wrong email of password",
          });
        }

        //if no errors
        const { password, ...rest } = user;
        const userInfo = Object.assign({}, { ...rest });

        const token = createToken(user);
        const decodedToken = jwtDecode(token);
        const expiresAt = decodedToken.exp;

        console.log(userInfo);
        res.json({
          message: "Successfully authenticated",
          token,
          userInfo,
          expiresAt,
        });
      });
    }
  })(req, res, next);
});

/*Logout handler*/
router.get("/logout", (req, res, next) => {
  req.logout();
  res.send({
    message: "Successfully logged out",
    redirect: "/",
  });
});

/* handle registration. */
router.post("/register", async (req, res, next) => {
  const { error, value } = validateUser(req.body);
  const { firstName,lastName,email, password, passwordConfirmation } = value;

  if (error) {
    return res.status(400).json(error.details[0].message);
  } else {
    //Check password match before creating user
    if (passwordConfirmation == password) {
      //find if the user already exist
      User.findOne({ email: email })
        .then((user) => {
          if (user) {
            return res.status(400).json("Email already exist");
          } else {
            const userDto = new User({
              firstName,
              lastName,
              email,
              password,
              role: "user",
            });

            bcrypt.genSalt(12, (err, salt) => {
              if (err) throw err;

              bcrypt.hash(userDto.password, salt, (err, hash) => {
                if (err) throw err;

                userDto.password = hash;

                const savedUser = userDto
                  .save()
                  .then((savedUser) => {
                    const token = createToken(savedUser);
                    const decodedToken = jwtDecode(token);
                    const expiresAt = decodedToken.exp;

                    const { firstName, lastName, email, role } = savedUser;

                    const userInfo = {
                      firstName,
                      lastName,
                      email,
                      role,
                    };
                    return res.json({
                      message: "User created!",
                      token,
                      userInfo,
                      expiresAt,
                    });
                  })
                  .catch((err) => {
                    return res.status(400).json({
                      message: "There was a problem creating your account",
                    });
                  });
              });
            });
          }
        })
        .catch((err) => {
          res
            .status(404)
            .json({ message: "There was a problem creating your account" });
        });
    }
  }
});

const validateUser = (user) => {
  const validationSchema = Joi.object()
    .keys({
      firstName: Joi.string().min(3).required(),
      lastName: Joi.string().min(3).required(),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required(),
      password: Joi.string()
        .pattern(new RegExp(/(?=.*[a-z]){8,30}/))
        .required(),
      passwordConfirmation: Joi.ref("password"),
    })
    .with("password", "passwordConfirmation");

  return validationSchema.validate(user);
};

module.exports = router;
