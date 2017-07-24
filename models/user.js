let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  activated:{
    type: Boolean,
    default: false
  }
});

let User = module.exports = mongoose.model('User', userSchema);
