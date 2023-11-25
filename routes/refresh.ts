/**
 * @route POST /refresh
 */

import { Router } from "express";
import { UserModel } from "../models/User";
import jwt, { VerifyCallback } from "jsonwebtoken";
import { TokenDataType } from "../types/types";
import { generateToken, jsonError } from "../utils";

const router = Router();

router.post("/", async (req, res) => {
  const refreshToken = req.body["refreshToken"];
  try {
    if (!refreshToken) return jsonError(res, 403, "Forbidden access!");

    const foundUser = await UserModel.findOne({ refreshToken });

    if (!foundUser) {
      //! Refresh token reuse detected!

      const resetUserTokensCB: VerifyCallback = async (err, decoded) => {
        if (err) return jsonError(res, 403, "Forbidden access!");

        /**
         *! Finding the hacked user and resetting all active sessions
         *! by removing issued refresh tokens
         */

        const user = await UserModel.findOne({
          username: (<TokenDataType>decoded).username,
        }).exec();

        if (user?.refreshToken) {
          user.refreshToken = [];
          await user.save();
        }
      };

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        resetUserTokensCB
      );

      return jsonError(res, 403, "Forbidden access!");
    }

    //* User exists for the issued refresh token

    const newRefTokenArray = foundUser.refreshToken.filter(
      (rt) => rt != refreshToken
    );

    const issueNewTokenCB: VerifyCallback = async (err, decoded) => {
      if (err) {
        //* Setting the tokens in case of token validation expires

        foundUser.refreshToken = [...newRefTokenArray];
        await foundUser.save();
      }
      if (err || (<TokenDataType>decoded).username !== foundUser.username)
        return jsonError(res, 403, "Forbidden access!");

      const tokenData: TokenDataType = {
        userId: foundUser._id,
        username: foundUser.username,
      };

      const [accessToken, refreshToken] = generateToken(tokenData);

      foundUser.refreshToken = [...newRefTokenArray, refreshToken];
      await foundUser.save();

      return res
        .status(200)
        .json({ error: false, user: foundUser, accessToken, refreshToken });
    };

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, issueNewTokenCB);
  } catch (error) {
    return jsonError(res, 500);
  }
});

export default router;
