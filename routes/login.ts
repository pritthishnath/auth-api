/**
 * @route POST /auth/login
 */

import { Router } from "express";
import { UserModel } from "../models/User";
import { comparePassword } from "../utils/passwordUtility";
import { generateToken } from "../utils/tokenUtility";

const router = Router();

type TLoginReqBody = {
  username: string;
  password: string;
};

router.post("/", async (req, res) => {
  const { username, password }: TLoginReqBody = req.body;

  try {
    const user = await UserModel.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: "Invalid credentials!" });
    }

    const pswMatch = comparePassword(password, user.password);

    if (!pswMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials!" });
    }

    const tokenData = { userId: user._id, username: user.username };

    const [accessToken, refreshToken] = generateToken(tokenData);

    user.refreshToken.push(refreshToken);

    await user.save();

    res.status(200).json({ error: false, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error!" });
  }
});

export default router;
