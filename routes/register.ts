/**
 * @route POST /register
 */

import { NextFunction, Request, Response, Router } from "express";
import { checkSchema, validationResult } from "express-validator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { jsonError, generateServerKey, generateToken } from "../utils";
import { TokenDataType } from "../types/types";
import UserModel from "../models/User";
import OTP from "../models/Otp";
import {
	sendLoginOtpEmail,
	sendRegistrationOtpEmail,
} from "../utils/otpTemplates";
import AuthCode from "../models/AuthCode";

const router = Router();

dotenv.config();

const mailTransporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PWD,
	},
});

const validationSchema = {
	username: {
		trim: true,
		isLength: { options: { min: 3 } },
		matches: { options: /^(?![0-9_]*$)[A-Z0-9_]+$/i },
		errorMessage: "Letters with numbers and '_' are allowed only",
	},
	email: {
		trim: true,
		notEmpty: true,
		matches: {
			options:
				/^(?=[a-zA-Z0-9][a-zA-Z0-9@._%+-]{5,253}$)[a-zA-Z0-9._%+-]{1,64}@(?:(?=[a-zA-Z0-9-]{1,63}\.)[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\.){1,8}[a-zA-Z]{2,63}$/i,
		},
		errorMessage: "Please enter a valid E-mail address",
	},
	password: {
		isLength: { options: { min: 6, max: 32 } },
		errorMessage: "Password should be 6-32 characters",
	},
	otp: {
		trim: true,
		matches: {
			options: /^[0-9]{6}$/,
		},
		errorMessage: "Invalid OTP",
	},
};

const validate = () => {
	return async (req: Request, res: Response, next: NextFunction) => {
		if (req.params.stage === "0") {
			await checkSchema(
				{ username: validationSchema.username, email: validationSchema.email },
				["body"],
			).run(req);

			const errors = validationResult(req);
			if (errors.isEmpty()) {
				return next();
			}

			return jsonError(res, 400, "", errors.array());
		}
		if (req.params.stage === "1") {
			await checkSchema(
				{
					username: {
						notEmpty: true,
					},
				},
				["body"],
			).run(req);

			const errors = validationResult(req);
			if (errors.isEmpty()) {
				return next();
			}

			return jsonError(res, 400, "", errors.array());
		}
		if (req.params.stage === "2") {
			await checkSchema(
				{
					otp: validationSchema.otp,
				},
				["body"],
			).run(req);

			const errors = validationResult(req);
			if (errors.isEmpty()) {
				return next();
			}

			return jsonError(res, 400, "", errors.array());
		}
	};
};

router.post("/:stage", validate(), async (req: Request, res: Response) => {
	const errors = validationResult(req).array();
	if (errors.length > 0) {
		return jsonError(res, 400, "", errors);
	}

	const stage = req.params.stage;

	const { username, email, otp, deviceKey } = req.body;

	if (stage === "0") {
		// Register
		try {
			const userRegistered = await UserModel.findOne({
				email,
				username,
			});

			if (userRegistered?.isActive === false) {
				const regeneratedOtp = await OTP.generateOTP(
					userRegistered?._id,
					deviceKey,
				);

				await sendRegistrationOtpEmail(
					mailTransporter,
					email,
					username,
					regeneratedOtp,
				);

				return res.status(200).json({
					error: false,
					user: userRegistered,
					serverKey: generateServerKey(),
				});
			}
			if (userRegistered?.isActive) {
				return jsonError(res, 409, "User already registered!", [
					{
						path: "username",
						msg: "User already registered!",
					},
				]);
			}

			const newUserData = new UserModel({
				username,
				email,
				refreshToken: [],
				isActive: false,
			});

			const newOtp = await OTP.generateOTP(newUserData._id, deviceKey);

			await sendRegistrationOtpEmail(mailTransporter, email, username, newOtp);

			await newUserData.save();

			res.status(200).json({
				error: false,
				user: newUserData.toJSON(),
				serverKey: generateServerKey(),
			});
		} catch (error) {
			console.log(error);
			jsonError(res, 500);
		}
	} else if (stage === "1") {
		// Login

		try {
			const foundedUser = await UserModel.findOne({
				$or: [{ username }, { email: username }],
				isActive: true,
			});

			if (!foundedUser) {
				return jsonError(res, 404, "Please register first!", [
					{ path: "email", msg: "Please register first!" },
				]);
			}

			const regeneratedOtp = await OTP.generateOTP(foundedUser._id, deviceKey);

			await sendLoginOtpEmail(
				mailTransporter,
				foundedUser.email,
				foundedUser.username,
				regeneratedOtp,
			);

			return res.status(200).json({
				error: false,
				user: foundedUser.toJSON(),
				serverKey: generateServerKey(),
			});
		} catch (error) {
			console.log(error);
			jsonError(res, 500);
		}
	} else if (stage === "2") {
		// Verification
		try {
			const foundedUser = await UserModel.findOne({
				$or: [{ username }, { email: username }],
			});

			if (!foundedUser) {
				return jsonError(res, 404, "Invalid credentials!", [
					{ path: "otp", msg: "Invalid credentials!" },
				]);
			}

			const isValid = await OTP.verifyOTP(foundedUser._id, otp, deviceKey);

			if (!isValid) {
				return jsonError(res, 400, "Invalid OTP", [
					{ path: "otp", msg: "Invalid OTP" },
				]);
			}

			foundedUser.isActive = true;

			const tokenData: TokenDataType = {
				userId: foundedUser._id,
				username: foundedUser.username,
			};

			const [accessToken, refreshToken] = generateToken(tokenData);

			foundedUser.refreshToken.push(refreshToken);
			const code = await AuthCode.generate(
				foundedUser._id,
				deviceKey,
				accessToken,
				refreshToken,
			);

			await foundedUser.save();

			res.status(200).json({
				error: false,
				user: foundedUser.toJSON(),
				code,
			});
		} catch (error) {
			console.log(error);
			jsonError(res, 500);
		}
	} else {
		jsonError(res, 400, "Invalid Route");
	}
});

export default router;
