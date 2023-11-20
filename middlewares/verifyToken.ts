import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized access!" });
    }
  } else
    return res.status(403).json({ error: true, message: "Forbidden access!" });
}
