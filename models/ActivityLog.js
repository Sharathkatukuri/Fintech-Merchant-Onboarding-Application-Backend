const mongoose = require("mongoose");

const { Schema } = mongoose;

const activityLogSchema = new Schema(
  {
    actorType: {
      type: String,
      enum: ["merchant", "admin", "system"],
      required: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      refPath: "actorModel",
      default: null,
    },
    actorModel: {
      type: String,
      enum: ["User", "AdminUser", null],
      default: null,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    targetApplication: {
      type: Schema.Types.ObjectId,
      ref: "MerchantApplication",
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ targetApplication: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
