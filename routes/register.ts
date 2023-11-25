/**
 * @route POST /register
 */

import { NextFunction, Request, Response, Router } from "express";
import {
  ContextRunner,
  checkSchema,
  validationResult,
} from "express-validator";
import nodemailer from "nodemailer";
import { UserModel } from "../models/User";
import {
  hashPassword,
  jsonError,
  randomPin,
  generateServerKey,
  generateToken,
} from "../utils";
import { TokenDataType } from "../types/types";

const router = Router();

const mailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PWD,
  },
});

const validationSchema = {
  username: {
    trim: true,
    isLength: { options: { min: 3 } },
    matches: { options: /^(?![0-9_]*$)[A-Z0-9_]+$/i },
    errorMessage: "Letters with numbers and '_' are allowed only",
  },
  email: {
    trim: true,
    notEmpty: true,
    matches: {
      options:
        /^(?=[a-zA-Z0-9][a-zA-Z0-9@._%+-]{5,253}$)[a-zA-Z0-9._%+-]{1,64}@(?:(?=[a-zA-Z0-9-]{1,63}\.)[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\.){1,8}[a-zA-Z]{2,63}$/i,
    },
    errorMessage: "Please enter a valid E-mail address",
  },
  password: {
    isLength: { options: { min: 6, max: 32 } },
    errorMessage: "Password should be 6-32 characters",
  },
  otp: {
    trim: true,
    matches: {
      options: /^[0-9]{6}$/,
    },
    errorMessage: "Invalid OTP",
  },
};

const validate = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.stage === "1") {
      await checkSchema(
        { username: validationSchema.username, email: validationSchema.email },
        ["body"]
      ).run(req);

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      return jsonError(res, 400, "", errors.array());
    } else if (req.params.stage === "2") {
      await checkSchema(
        { password: validationSchema.password, otp: validationSchema.otp },
        ["body"]
      ).run(req);

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      return jsonError(res, 400, "", errors.array());
    }
  };
};

router.post("/:stage", validate(), async (req: Request, res: Response) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    return jsonError(res, 400, "", errors);
  }

  const stage = req.params.stage;

  const { username, email, password, otp } = req.body;

  if (stage === "1") {
    try {
      const userAttempted = await UserModel.findOne({
        username: username,
        email: email,
        isActive: false,
      });

      if (userAttempted) {
        await mailTransporter.sendMail({
          from: '"Notes Keeper" <no-reply@pnath.in>', // sender address
          to: email, // list of receivers
          subject: "OTP to register | Notes Keeper", // Subject line
          text: `Hi ${username}, OTP for your e-mail validation for Notes Keeper is ${userAttempted?.otp}`, // plain text body
          html: `<p>Hi ${username}, OTP for your e-mail validation for Notes Keeper is ${userAttempted?.otp}</p><br /><br /><p>Auth Service - keeper.pnath.in</p>`, // html body
        });

        return res.status(200).json({
          error: false,
          user: userAttempted,
          serverKey: generateServerKey(),
        });
      }

      const user = await UserModel.exists({ $or: [{ email }, { username }] });

      if (user) {
        return jsonError(res, 409, "User already registered!");
      }

      const newOtp = randomPin(6);

      const newUserData = {
        username,
        email,
        otp: newOtp,
        refreshToken: [],
        isActive: false,
        password: "",
      };

      await mailTransporter.sendMail({
        from: '"Notes Keeper" <no-reply@pnath.in>', // sender address
        to: email, // list of receivers
        subject: "OTP to register | Notes Keeper", // Subject line
        text: `Hi ${username}, OTP for your e-mail validation for Notes Keeper is ${newOtp}`, // plain text body
        html: `<p>Hi ${username}, OTP for your e-mail validation for Notes Keeper is ${newOtp}</p><br /><br /><p>Auth Service - keeper.pnath.in</p>`, // html body
      });

      const newUser = await UserModel.create(newUserData);

      res.status(200).json({
        error: false,
        user: newUser,
        serverKey: generateServerKey(),
      });
    } catch (error) {
      jsonError(res, 500);
    }
  } else if (stage === "2") {
    try {
      const foundedUser = await UserModel.findOne({ username, email });

      if (!foundedUser) {
        return jsonError(res, 404, "Invalid credentials!");
      }

      if (foundedUser.otp !== otp) {
        return jsonError(res, 400, "Invalid OTP", [
          { path: "otp", msg: "Invalid OTP" },
        ]);
      }

      foundedUser.password = hashPassword(password);
      foundedUser.otp = "";
      foundedUser.isActive = true;

      const tokenData: TokenDataType = {
        userId: foundedUser._id,
        username: foundedUser.username,
      };

      const [accessToken, refreshToken] = generateToken(tokenData);

      foundedUser.refreshToken.push(refreshToken);

      await foundedUser.save();

      res
        .status(200)
        .json({ error: false, user: foundedUser, accessToken, refreshToken });
    } catch (error) {
      console.log(error);
      jsonError(res, 500);
    }
  } else {
    jsonError(res, 400, "Invalid Route");
  }
});

// router.get("/:uniqueId", async (req, res) => {
//   const uniqueId = req.params.uniqueId;
//   const type = req.query.type;

//   try {
//     const userExist = await UserModel.exists({
//       $or: [{ username: uniqueId }, { email: uniqueId }],
//     });

//     if (userExist) {
//       if (type === "username") {
//         return jsonError(res, 409, "Username taken");
//       } else if (type === "email") {
//         return jsonError(res, 409, "E-mail already registered");
//       } else {
//         return jsonError(res, 409, "User already registered");
//       }
//     } else res.status(200).json({ error: false });
//   } catch (error) {
//     jsonError(res, 500);
//   }
// });

export default router;
