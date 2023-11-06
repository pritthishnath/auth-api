import { Router } from "express";
import registerController from "./register";
import loginController from "./login";
import refreshController from "./refresh";
import logoutController from "./logout";

const router = Router();

router.use("/register", registerController);
router.use("/login", loginController);
router.use("/refresh", refreshController);
router.use("/logout", logoutController);

router.get("/", (req, res) => {
  res.json({
    message: "Authentication service running",
    availableEndpoints: ["register", "login", "logout", "refresh"],
  });
});

export default router;
