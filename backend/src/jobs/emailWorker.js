require("dotenv").config();

const { Worker } = require("bullmq");
const createRedisConnection = require("../config/redis");
const sendEmail = require("../utils/sendEmail");

const worker = new Worker(
  "auth-email",
  async (job) => {
    await sendEmail(job.data);
  },
  {
    connection: createRedisConnection(),
  },
);

worker.on("completed", (job) => {
  console.log(`Email job completed: ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(`Email job failed: ${job?.id}`, error.message);
});
