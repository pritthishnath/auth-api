import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jsonError } from "../utils";

type TokenDataType = {
  userId: string;
  username: string;
};

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  let token = req.headers["authorization-token"] as string;

  if (token !== "undefined") {
    try {
      const payload = jwt.verify(
        typeof token === "string" ? token : "",
        process.env.ACCESS_TOKEN_SECRET
      );

      if (payload && (<TokenDataType>payload).userId != undefined) {
        req.query.userId = (<TokenDataType>payload).userId;
        next();
      }
    } catch (error) {
      return jsonError(res, 401, "Unauthorized, try again");
    }
  } else return jsonError(res, 403, "Please login and try again");
}
