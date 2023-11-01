import { InferSchemaType, Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    username: String,
    email: String,
    password: String,
    refreshToken: [String],
  },
  { timestamps: true }
);

// export type TUser = InferSchemaType<typeof UserSchema>;
export type TUser = {
  name: string;
  username: string;
  email: string;
  password: string;
  refreshToken: string[];
};

export const UserModel = model<TUser>("user", UserSchema);
