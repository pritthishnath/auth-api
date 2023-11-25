/**
 * @route PUT /logout
 */

import { Router } from "express";
import { UserModel } from "../models/User";
import { jsonError } from "../utils";

const router = Router();

router.post("/", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const foundUser = await UserModel.findOne({ refreshToken }).exec();

    if (!foundUser) {
      return res.sendStatus(204);
    }

    foundUser.refreshToken = foundUser.refreshToken.filter(
      (rt) => rt != refreshToken
    );

    await foundUser.save();

    return res.sendStatus(200);
  } catch (error) {
    return jsonError(res, 500);
  }
});

export default router;
