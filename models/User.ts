import { InferSchemaType, Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: String,
    email: String,
    password: String,
    otp: String,
    isActive: Boolean,
    refreshToken: [String],
  },
  { timestamps: true }
);

// export type TUser = InferSchemaType<typeof UserSchema>;
export type TUser = {
  username: string;
  email: string;
  password: string;
  otp: string;
  isActive: boolean;
  refreshToken: string[];
};

export const UserModel = model<TUser>("user", UserSchema);
