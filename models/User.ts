import { Schema, model, Document } from "mongoose";
export interface IUser extends Document {
	username: string;
	email: string;
	password: string;
	otp: string;
	isActive: boolean;
	refreshToken: string[];
}

const UserSchema = new Schema<IUser>(
	{
		username: String,
		email: String,
		password: String,
		otp: String,
		isActive: Boolean,
		refreshToken: [String],
	},
	{ timestamps: true },
);

// export type TUser = InferSchemaType<typeof UserSchema>;

const UserModel = model<IUser>("user", UserSchema);

export default UserModel;
