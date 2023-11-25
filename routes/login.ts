/**
 * @route POST /login
 */

import { NextFunction, Request, Response, Router } from "express";
import {
  ContextRunner,
  checkSchema,
  validationResult,
} from "express-validator";
import { UserModel } from "../models/User";
import { comparePassword, generateToken, jsonError } from "../utils";
import { TokenDataType } from "../types/types";

const router = Router();

const validationSchema = {
  username: {
    trim: true,
    notEmpty: true,
    errorMessage: "Enter your user ID",
  },
  password: {
    isLength: { options: { min: 6 } },
    errorMessage: "Enter a valid password",
  },
};

router.post(
  "/",
  checkSchema(validationSchema, ["body"]),
  async (req: Request, res: Response) => {
    const errors = validationResult(req).array();
    if (errors.length > 0) {
      return jsonError(res, 400, "", errors);
    }

    const { username, password } = req.body;

    try {
      const user = await UserModel.findOne({
        $or: [{ username }, { email: username }],
      });

      if (!user) {
        return jsonError(res, 404, "Invalid credentials!");
      }

      const pswMatch = comparePassword(password, user.password);

      if (!pswMatch) {
        return jsonError(res, 403, "Invalid credentials!");
      }

      const tokenData: TokenDataType = {
        userId: user._id,
        username: user.username,
      };

      const [accessToken, refreshToken] = generateToken(tokenData);

      user.refreshToken.push(refreshToken);

      await user.save();

      res.status(200).json({ error: false, user, accessToken, refreshToken });
    } catch (error) {
      jsonError(res, 500);
    }
  }
);

export default router;
