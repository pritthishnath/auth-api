/**
 * @route METHOD /token
 */

import { Router } from "express";
import UserModel from "../models/User";
import { jsonError } from "../utils";
import AuthCode from "../models/AuthCode";

const tokenRouter = Router();

tokenRouter.get("/", async (req, res) => {
  const code = req.query.code;
  const deviceKey = req.body.deviceKey;

  try {
    if (!code) {
      return jsonError(res, 404, "Please login and try again");
    }

    const codeDoc = await AuthCode.findOne({
      deviceKey,
      code,
    }).lean();

    if (!codeDoc) {
      return jsonError(res, 404, "Please login and try again");
    }

    res
      .status(200)
      .json({
        error: false,
        accessToken: codeDoc.accessToken,
        refreshToken: codeDoc.refreshToken,
      });
  } catch (error) {
    jsonError(res, 400, "Please login and try again");
  }
});

export default tokenRouter;
