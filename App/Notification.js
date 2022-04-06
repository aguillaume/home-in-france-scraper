// import * as nodemailer from "nodemailer"
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gllm.lp.17@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

let ctx = null;

async function sendEmail(context, properties, emailSubject) {
    ctx = context ?? console;
    try {
        ctx.log("Trying to send email...");
    
        var mailOptions = {
            from: 'gllm.lp.17@gmail.com',
            to: 'guillaumealpe@hotmail.com, roksana.bln@gmail.com',
            subject: emailSubject,
            text: JSON.stringify(properties, null, 2)
        };
    
        const info = await transporter.sendMail(mailOptions);
        ctx.log(`Email sent: ${info.messageId}`);
    } 
    catch (err) {
        ctx.log("Failed to send email.");
        ctx.log(err);
    }
}

module.exports = { sendEmail };