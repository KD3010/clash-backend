import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    secure: false,
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.FROM
    }
})

export const sendEmail = async (to: string) => {
    try {
        const source = fs.readFileSync(__dirname + '/email_template.html', 'utf-8').toString();
        const template = handlebars.compile(source);

        const replacements = {
            username: "Mana"
        }

        await transporter.sendMail({
            from: process.env.FROM,
            to: to,
            subject: "Ready to Clash? Help Us Decide Which Image Rules Them All!",
            html: template(replacements)
        })
    } catch(error) {
        console.log(error)
    }

}