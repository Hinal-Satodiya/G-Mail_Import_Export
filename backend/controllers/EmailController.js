const nodemailer = require("nodemailer");
const path = require("path");
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: true,
  auth: {
    
    user: 'hsatodiya.netclues@gmail.com',
     pass: 'tahh bkle edmi snqm'
  },
});

const sendEmail = (document, rows, duplicateRecords) => {
  const mailOptions = {
    from: "hsatodiya.netclues@gmail.com",
    to: "hsatodiya.netclues@gmail.com",
    subject: "Hinal send you the mail regarding your file...!",
    text: `This ${
      document.filename
    } contains total ${rows} rows and you have total ${
      duplicateRecords.length
    } duplicate entry so your valid ${
      rows - duplicateRecords.length
    } records are inserted`,
    attachments: [
      {
        filename: document.filename,
        path: path.join(__dirname, "../uploads/" + document.filename),
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { sendEmail };
