const sendEmail = require("./sendEmail");

const shouldUseEmailQueue = () => process.env.USE_EMAIL_QUEUE === "true";

const sendAuthEmail = async (payload) => {
  if (!shouldUseEmailQueue()) {
    await sendEmail(payload);
    return;
  }

  const { addEmailJob } = require("../jobs/emailQueue");
  await addEmailJob(payload);
};

module.exports = sendAuthEmail;
