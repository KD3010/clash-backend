import { Queue, Worker, type Job } from "bullmq";
import { defaultQueueOptions, redisConnection } from "../config/queue";
import { sendEmail } from "../config/mail";
import { emailQueueName } from "../constants";

export const emailQueue = new Queue(emailQueueName, {
    connection: redisConnection,
    defaultJobOptions: defaultQueueOptions
})

interface EmailJobData {
    to: string,
    subject: string,
    body: string
}

export const queueWorker = new Worker(emailQueueName, async (job: Job) => {
    const data: EmailJobData = job.data;
    await sendEmail(data.to, data.subject, data.body)
},
{
    connection: redisConnection
});