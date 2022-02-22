const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: [true, 'A user must have a name'],
    maxlength: [25, 'Username must be less than 15 letters'],
    minlength: [5, 'Username must be more than 8 letters'],
  },
  email: {
    type: String,
    require: [true, ' Please provide your email'],
    validate: [validator.isEmail, 'Please enter the correct email'],
    unique: true,
    lowercase: true,
  },
  userPhoto: {
    type: String,
  },
  password: {
    type: String,
    maxlength: [16, 'User password must be less than 15 letters'],
    minlength: [8, 'User password must be more than 8 letters'],
    require: [true, 'A user must have a profile photo'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    //This only works on SAVE!!!!!
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'Please confirm your password correctly',
    },
    require: [true, 'Please confirm your password'],
  },
});

//Using mongoose middlewares for encryptions

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  //Encryption
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  return next();
});

const user = mongoose.model('User', userSchema);

module.exports = user;
