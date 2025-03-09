import { Router } from "express";
import registerController from "./register";
import loginController from "./login";
import refreshController from "./refresh";
import logoutController from "./logout";
import userController from "./user";
import { generateServerKey } from "../utils";
import { checkServerToken, removeExistingRefreshToken } from "../middlewares";
import { verifyToken } from "../middlewares/verifyToken";
import { setDeviceKey } from "../middlewares/setDeviceKey";

const router = Router();

router.use(
  "/register",
  removeExistingRefreshToken,
  checkServerToken,
  setDeviceKey,
  registerController
);
router.use("/login", removeExistingRefreshToken, loginController);
router.use("/refresh", refreshController);
router.use("/logout", logoutController);
router.use("/user", verifyToken, userController);

router.get("/", (req, res) => {
  res.json({ message: "Authentication service running" });
});

router.get("/server-key", (req, res) => {
  res.json({ error: false, serverKey: generateServerKey() });
});

export default router;
