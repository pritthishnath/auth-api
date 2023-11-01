/**
 * @route POST /auth/refresh
 */

import { Router } from "express";
import { UserModel } from "../models/User";
import jwt, { VerifyCallback } from "jsonwebtoken";
import { TTokenData } from "../types/types";
import { generateToken } from "../utils/tokenUtility";

const router = Router();

router.post("/", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  try {
    const foundUser = await UserModel.findOne({ refreshToken }).exec();

    if (!foundUser) {
      //! Refresh token reuse detected!

      const resetUserTokensCB: VerifyCallback = async (err, decoded) => {
        if (err) return res.sendStatus(401);

        /**
         *! Finding the hacked user and resetting all active sessions
         *! by removing issued refresh tokens
         */

        const user = await UserModel.findOne({
          username: (<TTokenData>decoded).username,
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

      return res.sendStatus(401);
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
      if (err || (<TTokenData>decoded).username !== foundUser.username)
        return res.sendStatus(401);

      const tokenData: TTokenData = {
        userId: foundUser._id,
        username: foundUser.username,
      };

      const [accessToken, refreshToken] = generateToken(tokenData);

      foundUser.refreshToken = [...newRefTokenArray, refreshToken];
      await foundUser.save();

      return res.status(200).json({ error: false, accessToken, refreshToken });
    };

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, issueNewTokenCB);
  } catch (error) {
    return res.sendStatus(500);
  }
});

export default router;
