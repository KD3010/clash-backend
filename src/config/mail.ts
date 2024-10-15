import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    secure: false,
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.FROM
    }
})

export const sendEmail = async (to: string, subject: string, body: string) => {
    try {
        await transporter.sendMail({
            from: process.env.FROM,
            to: to,
            subject: subject,
            html: body
        })
    } catch(error) {
        console.log(error)
    }

}