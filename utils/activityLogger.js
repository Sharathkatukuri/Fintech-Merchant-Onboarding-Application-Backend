const ActivityLog = require("../models/ActivityLog");

const logActivity = async ({
  actorType,
  actorId = null,
  actorModel = null,
  action,
  targetApplication = null,
  message,
  metadata = {},
}) => {
  try {
    await ActivityLog.create({
      actorType,
      actor: actorId,
      actorModel,
      action,
      targetApplication,
      message,
      metadata,
    });
  } catch (error) {
    console.error("Failed to write activity log:", error.message);
  }
};

module.exports = logActivity;
