const nodemailer = require('nodemailer');
const mailCredentials = require('../config/mailCredentials');

// create reusable transporter object
const transporter = nodemailer.createTransport({
  host: mailCredentials.host,
  port: 465,
  secure: true,
  auth: {
    user: mailCredentials.email,
    pass: mailCredentials.password
  }
});

module.exports = transporter;
