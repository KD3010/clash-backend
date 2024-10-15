import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import "dotenv/config"
import fs from 'fs';
import handlebars from 'handlebars';

import { EmailJobs } from './jobs';
import Router from './routes';

const app: Application = express();
const PORT = process.env.PORT || 8000;

app.use(cors())
app.use(express.json());
app.use(Router);

app.get("/", async (req: Request, res: Response) => {
    const source = fs.readFileSync(__dirname + '/public/welcome_email_template.html', 'utf-8').toString();
    const template = handlebars.compile(source);

    const replacements = {
        username: "Kushagra"
    }
    await EmailJobs.emailQueue.add('emailQueue', {
        to: 'iamkd30@gmail.com',
        subject: "Ready to Clash? Help Us Decide Which Image Rules Them All!",
        body: template(replacements)
    });

    res.status(200).json({
        message: "MAIL SENT SUCCESFULLY"
    })
})

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})