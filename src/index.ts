import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import "dotenv/config"
import { sendEmail } from './config/mail';

const app: Application = express();
const PORT = process.env.PORT || 8000;

app.use(cors())
app.use(express.json());

app.get("/", async (req: Request, res: Response) => {

    await sendEmail("manakhare5@gmail.com")

    res.status(200).json({
        message: "MAIL SENT SUCCESFULLY"
    })
})

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})