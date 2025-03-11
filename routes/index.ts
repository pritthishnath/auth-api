import { Router } from "express";
import registerController from "./register";
import loginController from "./login";
import refreshController from "./refresh";
import logoutController from "./logout";
import userController from "./user";
import { generateServerKey } from "../utils";
import { removeExistingRefreshToken } from "../middlewares";
import { verifyToken } from "../middlewares/verifyToken";
import { setDeviceKey } from "../middlewares/setDeviceKey";
import tokenRouter from "./token";
import callbackRouter from "./callback";

const router = Router();

router.use(
  "/register",
  removeExistingRefreshToken,
  setDeviceKey,
  registerController
);
router.use("/token", setDeviceKey, tokenRouter);
router.use("/callback", callbackRouter);
router.use("/login", removeExistingRefreshToken, loginController);
router.use("/refresh", refreshController);
router.use("/logout", logoutController);
router.use("/user", verifyToken, userController);

router.get("/", (req, res) => {
  res.json({ message: "Authentication service running" });
});
router.get("/device-key", setDeviceKey, (req, res) => {
  res.json({ error: false, deviceKey: req.body.deviceKey });
});
router.get("/server-key", (req, res) => {
  res.json({ error: false, serverKey: generateServerKey() });
});

export default router;
