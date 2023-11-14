/**
 * @route POST /register
 */

import { Router } from "express";
import { generateToken } from "../utils/tokenUtility";
import { UserModel } from "../models/User";
import { hashPassword } from "../utils";
import { TokenDataType } from "../types/types";

const router = Router();

router.post("/", async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const user = await UserModel.exists({ $or: [{ email }, { username }] });

    if (user) {
      return res
        .status(409)
        .json({ error: true, message: "User already exists!" });
    }

    const newUserData = {
      name,
      username,
      email,
      password: hashPassword(password),
      refreshToken: [],
    };

    const newUser = await UserModel.create(newUserData);

    const tokenData: TokenDataType = {
      userId: newUser._id,
      username: newUser.username,
    };

    const [accessToken, refreshToken] = generateToken(tokenData);

    newUser.refreshToken.push(refreshToken);

    await newUser.save();

    res
      .status(200)
      .json({ error: false, user: newUser, accessToken, refreshToken });
  } catch (error) {
    res.sendStatus(500);
  }
});

export default router;
