/**
 * @route METHOD /user
 */

import { Router } from "express";
import { UserModel } from "../models/User";
import { jsonError } from "../utils";

const router = Router();

router.get("/", async (req, res) => {
  const userId = req.query.userId;

  try {
    if (userId) {
      const foundUser = await UserModel.findOne(
        { _id: userId },
        "_id name username email"
      );

      res.status(200).json({ error: false, user: foundUser });
    }
  } catch (error) {
    jsonError(res, 400, "Please login and try again");
  }
});

export default router;
