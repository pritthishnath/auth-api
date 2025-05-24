import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

export const generateDeviceKey = (
	userAgent: string,
	ipAddress: string,
	additionalInfo = "",
): string => {
	const data = `${userAgent}|${ipAddress}|${additionalInfo}`;
	return crypto.createHash("sha256").update(data).digest("hex");
};

export const setDeviceKey = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const userAgent = req.headers["user-agent"] || "";
	const ipAddress = req.ip || req.socket.remoteAddress || "";

	req.body.deviceKey =
		req.body.deviceKey || generateDeviceKey(userAgent, ipAddress);

	next();
};
