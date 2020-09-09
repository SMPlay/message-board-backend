const nodemailer = require('nodemailer');
const createMessage = require('../email-message-template/createMessage');
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'is1285850@gmail.com',
    pass: '1q2w3e4r5t6y7u8i9o0p!q'
  }
});

export const sendAuthorizationMessage = async (token: string, email: string) => {
  const Message = {
    from: "Eblobai online",
    to: email,
    subject: "Подтверждение регистрации",
    html: createMessage(token, 'Подтверждение регистрации','confirm'),
  };
  await transporter.sendMail(Message);
}

export const sendResetPasswordMessage = async (token: string, email: string) => {
  const Message = {
    from: "Eblobai online",
    to: email,
    subject: "Сброс пароля",
    html: createMessage(token, 'Сброс пароля','resetPassword'),
  };
  await transporter.sendMail(Message);
}