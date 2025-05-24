import { NextFunction, Request, Response } from "express";
import UserModel from "../models/User";

export async function removeExistingRefreshToken(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { refreshToken } = req.body;

	if (refreshToken) {
		const foundUser = await UserModel.findOne({ refreshToken }).exec();

		if (foundUser) {
			const newRefTokenArray = foundUser.refreshToken.filter(
				(rt) => rt !== refreshToken,
			);

			foundUser.refreshToken = [...newRefTokenArray];

			await foundUser.save();
		}
	}

	next();
}
