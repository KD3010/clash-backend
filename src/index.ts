import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import "dotenv/config"

const app: Application = express();
const PORT = process.env.PORT || 8000;

app.use(cors())
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hello from server using concurrently")
})

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})