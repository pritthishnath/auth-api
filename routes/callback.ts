/**
 * @route METHOD /token
 */

import { Router } from "express";
import UserModel from "../models/User";
import { generateToken, jsonError } from "../utils";
import AuthCode from "../models/AuthCode";
import { TokenDataType } from "../types/types";

const callbackRouter = Router();

callbackRouter.get("/:provider", async (req, res) => {
  const provider = req.params.provider;
  const code = req.query.code;
  const state = req.query.state as string;

  let deviceKey;
  let clientOrigin;
  try {
    // Parse the state parameter to get your custom data
    const stateData = JSON.parse(decodeURIComponent(state));
    deviceKey = stateData.deviceKey;
    clientOrigin = stateData.clientOrigin;
  } catch (error) {
    deviceKey = null;
  }

  try {
    if (!code) {
      return jsonError(res, 404, "Code not found");
    }

    if (provider === "github") {
      const body = {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      };

      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const tokenData = await tokenResponse.json();
      const githubAccessToken = tokenData.access_token;

      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
        },
      });

      const userData = await userResponse.json();

      if (!userData) {
        return jsonError(res, 404, "Github User not found");
      }

      let user = await UserModel.findOne({
        email: userData.email,
      });

      if (!user) {
        user = new UserModel({
          username: userData.login,
          email: userData.email,
          refreshToken: [],
          isActive: true,
        });
      }

      const tokenPayload: TokenDataType = {
        userId: user._id,
        username: user.username,
      };

      const [accessToken, refreshToken] = generateToken(tokenPayload);

      user.refreshToken.push(refreshToken);
      const authCode = await AuthCode.generate(
        user._id,
        deviceKey,
        accessToken,
        refreshToken
      );

      await user.save();

      res.redirect(
        `https://login.pnath.in/callback/success?code=${authCode}&client_origin=${clientOrigin}`
      );
    } else {
      return jsonError(res, 404, "Provider not found");
    }
  } catch (error) {
    jsonError(res, 500, "Server error!");
  }
});

export default callbackRouter;
