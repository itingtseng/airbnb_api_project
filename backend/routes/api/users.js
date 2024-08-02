const express = require('express');
const bcrypt = require('bcryptjs');
const { setTokenCookie } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

  const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Invalid email'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Username is required'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.'),
    check('firstName')
      .exists({ checkFalsy: true })
      .withMessage('First name is required.'),
    check('lastName')
      .exists({ checkFalsy: true })
      .withMessage('Last name is required.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
  ];


// Sign up
router.post('/', validateSignup, async (req, res) => {
  const { firstName, lastName, email, password, username } = req.body
  const hashedPassword = bcrypt.hashSync(password)
  const user = await User.build({ firstName, lastName, email, username, hashedPassword })
  const sameemailUser = await User.findOne({
    where: {
        email: user.email,
      }
  })
  const sameusernamelUser = await User.findOne({
    where: {
        username: user.username,
      }
  })
  if (sameemailUser) {
      return res.status(500).json({
        message: "User already exists",
        errors: {
        email: "User with that email already exists",
      }
      })
  }
  if (sameusernamelUser) {
    return res.status(500).json({
      message: "User already exists",
      errors: {
      username: "User with that username already exists"
    }
    })
  }
  await user.save()
  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.status(201).json({
    user: safeUser
  });
});
module.exports = router;