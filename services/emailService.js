const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify((error) => {
  if (error) {
    console.error('Mail server connection error:', error);
  } else {
    console.log('📧 Mail server ready to send emails');
  }
});

exports.sendShareNotification = async (senderName, recipientEmail, documentTitle, documentPath) => {
  try {
    await fs.promises.access(documentPath, fs.constants.R_OK);

    const mailOptions = {
      from: `"Document Sharing" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `New Document Shared: ${documentTitle}`,
      html: `
        <h2>Document Shared with You</h2>
        <p><strong>${senderName}</strong> has shared a document with you:</p>
        <ul>
          <li><strong>Document Title:</strong> ${documentTitle}</li>
        </ul>
        <p>The document is attached to this email.</p>
      `,
      attachments: [{
        filename: `${documentTitle}${path.extname(documentPath)}`,
        path: documentPath
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📨 Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('📧 Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
exports.sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"SecureDoc" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1877f2;">Password Reset Request</h2>
          <p>We received a request to reset your password. Your OTP is:</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0; letter-spacing: 3px;"><code>${otp}</code></h3>
          </div>
          <p>This OTP will expire in 5 minutes. If you didn't request this, please ignore this email.</p>
          <hr style="border: 1px solid #ddd;">
          <p style="color: #666; font-size: 0.9em;">SecureDoc Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};
