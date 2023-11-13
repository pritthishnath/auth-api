import { Router } from "express";
import registerController from "./register";
import loginController from "./login";
import refreshController from "./refresh";
import logoutController from "./logout";
import { encrypt, randomString } from "../utils";
import { serverTokens } from "../constants";
import { checkServerToken, removeExistingRefreshToken } from "../middlewares";

const router = Router();

router.use(
  "/register",
  removeExistingRefreshToken,
  checkServerToken,
  registerController
);
router.use("/login", removeExistingRefreshToken, loginController);
router.use("/refresh", refreshController);
router.use("/logout", logoutController);

router.get("/", (req, res) => {
  res.json({
    message: "Authentication service running",
    availableEndpoints: ["register", "login", "logout", "refresh"],
  });
});

router.get("/server-key", (req, res) => {
  const token = randomString(5);

  const key = encrypt(token);

  serverTokens.set(key, token);

  setTimeout(() => {
    serverTokens.delete(key);
  }, 60 * 1000 * 5); // Unused server tokens expires in 5 minutes

  res.json({ error: false, serverKey: key });
});

export default router;
