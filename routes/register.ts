/**
 * @route POST /register
 */

import { Router } from "express";
import { generateToken } from "../utils/tokenUtility";
import { UserModel } from "../models/User";
import { hashPassword } from "../utils/passwordUtility";
import { TTokenData } from "../types/types";

const router = Router();

type TRegisterReqBody = {
  name: string;
  username: string;
  email: string;
  password: string;
};

router.post("/", async (req, res) => {
  const { name, username, email, password }: TRegisterReqBody = req.body;
  console.log(username, password);

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

    const tokenData: TTokenData = {
      userId: newUser._id,
      username: newUser.username,
    };

    const [accessToken, refreshToken] = generateToken(tokenData);

    newUser.refreshToken.push(refreshToken);

    await newUser.save();

    res.status(200).json({ error: false, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: true, message: `Internal server error!` });
  }
});

export default router;
