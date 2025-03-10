import { Model, model, Schema, Types } from "mongoose";
import crypto from "crypto";

export interface IAuthCode extends Document {
  userId: Types.ObjectId;
  code: string;
  deviceKey: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
}

// Interface for OTP model with static methods
export interface IAuthCodeModel extends Model<IAuthCode> {
  generate(userId: string, deviceKey: string, accessToken: string, refreshToken: string): Promise<string>;
  verify(userId: string, code: string, deviceKey: string): Promise<boolean>;
}

// Auth code Schema
const AuthCodeSchema: Schema = new Schema<IAuthCode>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  code: {
    type: String,
    required: true,
  },
  deviceKey: {
    type: String,
    required: true,
    index: true,
  },
  accessToken: String,
  refreshToken: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes in seconds
  },
});

// Compound index for faster lookups
AuthCodeSchema.index({ userId: 1, deviceKey: 1 });

AuthCodeSchema.statics.generate = async function (
  userId: Types.ObjectId,
  deviceKey: string,
  accessToken: string,
  refreshToken: string
): Promise<string> {
  // Generate a code
  const code: string = crypto.randomBytes(16).toString("hex");

  // Delete any existing code for this user+device combination
  await this.deleteMany({ userId, deviceKey });

  // Create a new code document
  await this.create({
    userId,
    code,
    deviceKey,
    accessToken,
    refreshToken,
  });

  return code;
};

// Method to verify an OTP
AuthCodeSchema.statics.verify = async function (
  userId: Types.ObjectId,
  code: string,
  deviceKey: string
): Promise<boolean> {
  const codeDoc = await this.findOne({ userId, code, deviceKey });

  if (!codeDoc) {
    return false;
  }

  // Code is valid, delete it to prevent reuse
  await this.deleteOne({ _id: codeDoc._id });

  return true;
};

// Create and export the model
const AuthCode = model<IAuthCode, IAuthCodeModel>("authcode", AuthCodeSchema);

export default AuthCode;
