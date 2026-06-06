const { Queue } = require("bullmq");
const createRedisConnection = require("../config/redis");

const emailQueue = new Queue("auth-email", {
  connection: createRedisConnection(),
});

const addEmailJob = async (payload) => {
  await emailQueue.add("send-email", payload, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: 100,
  });
};

module.exports = {
  emailQueue,
  addEmailJob,
};
