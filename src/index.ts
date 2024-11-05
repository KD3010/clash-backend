import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import "dotenv/config"

import Router from './routes';

export const app: Application = express();
export const PORT = process.env.PORT || 8000;

app.use(cors())
app.use(express.json());
app.use(Router);

app.get("/", async (_: Request, res: Response) => {
    res.status(200).json({
        message: "Happy Diwali!"
    })
})

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})