import jwt from "jsonwebtoken";
import { serverTokens } from "../constants";
import { encrypt } from "./cipherUtility";
import { randomString } from "./stringUtility";

export function generateToken(data: object, type?: string): string | string[] {
	switch (type) {
		case "access":
			return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: "5m",
			});

		case "refresh":
			return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
				expiresIn: "10d",
			});

		default: {
			const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: "5m",
			});

			const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
				expiresIn: "10d",
			});

			return [accessToken, refreshToken];
		}
	}
}

export function generateServerKey(): string {
	const token = randomString(5);

	const key = encrypt(token);

	serverTokens.set(key, token);

	setTimeout(
		() => {
			serverTokens.delete(key);
		},
		60 * 1000 * 5,
	); // Unused server tokens expires in 5 minutes

	return key;
}
