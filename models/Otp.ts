import { Model, model, Schema, Types } from "mongoose";
import crypto from "crypto";

export interface IOTP extends Document {
  userId: Types.ObjectId;
  otp: string;
  deviceKey: string;
  createdAt: Date;
}

// Interface for OTP model with static methods
export interface IOTPModel extends Model<IOTP> {
  generateOTP(userId: string, deviceKey: string): Promise<string>;
  verifyOTP(userId: string, otp: string, deviceKey: string): Promise<boolean>;
  getAllActiveOTPs(userId: string): Promise<IOTP[]>;
}

// OTP Schema
const OTPSchema: Schema = new Schema<IOTP>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  deviceKey: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes in seconds
  },
});

// Compound index for faster lookups
OTPSchema.index({ userId: 1, deviceKey: 1 });

// Method to generate a new OTP
OTPSchema.statics.generateOTP = async function (
  userId: Types.ObjectId,
  deviceKey: string
): Promise<string> {
  // Generate a 6-digit OTP
  const otp: string = crypto.randomInt(100000, 999999).toString();

  // Delete any existing OTP for this user+device combination
  await this.deleteMany({ userId, deviceKey });

  // Create a new OTP document
  await this.create({
    userId,
    otp,
    deviceKey,
  });

  return otp;
};

// Method to verify an OTP
OTPSchema.statics.verifyOTP = async function (
  userId: Types.ObjectId,
  otp: string,
  deviceKey: string
): Promise<boolean> {
  const otpDoc = await this.findOne({ userId, otp, deviceKey });

  if (!otpDoc) {
    return false;
  }

  // OTP is valid, delete it to prevent reuse
  await this.deleteOne({ _id: otpDoc._id });

  return true;
};

// Method to get all active OTPs for a user
OTPSchema.statics.getAllActiveOTPs = async function (
  userId: string
): Promise<IOTP[]> {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Create and export the model
const OTP = model<IOTP, IOTPModel>("otp", OTPSchema);

export default OTP;
