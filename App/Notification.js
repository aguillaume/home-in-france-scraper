import * as nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gllm.lp.17@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

function sendEmail(properties, emailSubject) {
    try {
        console.log("Trying to send email...");
    
        var mailOptions = {
            from: 'gllm.lp.17@gmail.com',
            to: 'guillaumealpe@hotmail.com, roksana.bln@gmail.com',
            subject: emailSubject,
            text: JSON.stringify(properties, null, 2)
        };
    
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (err) {
        console.log("Failed to send email.");
        console.error(err);
    }
}

export { sendEmail };