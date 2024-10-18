import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import "dotenv/config"

import Router from './routes';
import { renderEmailTemplate } from './helper';
import { EmailJobs } from './jobs';

const app: Application = express();
const PORT = process.env.PORT || 8000;

app.use(cors())
app.use(express.json());
app.use(Router);

app.get("/", async (_: Request, res: Response) => {
    const template = renderEmailTemplate('onboarding-email.html');

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