/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 * 
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gllm.lp.17@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = async function (ctx, data) {
    try {
        ctx.log("Trying to send email...");

        var mailOptions = {
            from: 'gllm.lp.17@gmail.com',
            to: data.type == "Error" ? 'guillaumealpe@hotmail.com' : 'guillaumealpe@hotmail.com, roksana.bln@gmail.com',
            subject: data.type == "Error" ? "Home In France Scraper Error" : data.emailSubject,
            text: data.type == "Error" ? data.error.message : JSON.stringify(data, null, 2)
        };
    
        const info = await transporter.sendMail(mailOptions);
        ctx.log(`Email sent: ${info.messageId}`);
    } 
    catch (err) {
        ctx.log("Failed to send email.");
        ctx.log(err);
        throw(err)
    }
}
