const EmailLog = require('../models/EmailLog');

class EmailLogger {
  logEmail(to, subject, type = "generic", html = "", status = "sent") {
    try {
      EmailLog.create({
        to,
        subject,
        type,
        status,
        html: html || ""
      }).catch(err => console.error("📌 EmailLogger save fail (async):", err.message));
      return { success: true };
    } catch (err) {
      console.error("📌 EmailLogger log fail:", err.message);
      return { success: false, error: err.message };
    }
  }

  async getLogs() {
    try {
      const logs = await EmailLog.find().sort({ time: -1 }).lean();
      return logs;
    } catch (err) {
      console.error("📌 EmailLogger getLogs fail:", err.message);
      return [];
    }
  }
}

module.exports = new EmailLogger();
