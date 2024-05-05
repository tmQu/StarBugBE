import nodemailer from 'nodemailer';



const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "nq2018.tranminhquang170403@gmail.com",
        pass: "qmnx jdcz rqwb ssep"
    }
});

const mailOptions = {
    from: process.env.EMAIL,
    subject: 'Email Verification',
    text: 'Click the link below to verify your email'
}

const sendEmail = async (email, actionLink) => {
    try {
        await transporter.sendMail({
            ...mailOptions,
            html: `<h1>Verify your email</h1>
            <p>Click the link below to verify your email</p>
            <a href=${actionLink}>Verify Email</a>
            <img src="cid:logo" />`,
            to: email
        });
    }
    catch(error) {
        console.log(error);
    }
}
 
export default sendEmail;