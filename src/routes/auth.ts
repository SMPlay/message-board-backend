import { Request, Response, Router } from "express";
import { validationResult } from "express-validator";
import { compare, hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import cookie from "cookie";

import {
  createTokens, getAuthenticatedUserId, registrationValidator, sendAuthorizationMessage,
  setTokensIntoHeader,
} from "../utils";
import {
  ConfirmToken, ConfirmTokenModel, RefreshTokenModel, User, UserModel,
} from "../models";

export const authRouter = Router();

export interface RegistrationRequest extends Request {
    body: {
        name: string;
        login: string;
        email: string;
        password: string;
        confirmPassword: string;
    }
}

export interface ConfirmUserRequest extends Request {
    body: {
        token: string,
    }
}

export interface LoginRequest extends Request {
    body: {
        login: string,
        password: string,
    }
}

authRouter.post("/registration", registrationValidator, async (req: RegistrationRequest, res: Response) => {
  const {
    body: {
      email, password, name, login,
    },
  } = req;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: errors.array()[0].msg });
    return;
  }

  try {
    const existingUserByLogin = await UserModel.findOne({ login });
    const existingUserByEmail = await UserModel.findOne({ email });

    if (existingUserByLogin) {
      res.status(403).json({ message: "User with this login is already exists!" });
      return;
    }

    if (existingUserByEmail) {
      res.status(403).json({ message: "User with this email is already exists!" });
      return;
    }
    const hashedPassword = await hash(password, 12);
    const user = new UserModel({
      name,
      login,
      email,
      password: hashedPassword,
      isConfirmed: false,
      isAdmin: false,
    });
    const registeredUser = await user.save();
    const refreshToken = new RefreshTokenModel({
      token: "",
      userId: registeredUser.id,
    });
    await refreshToken.save();
    const confirmToken = uuidv4();
    const confirmTokenDocument = new ConfirmTokenModel({
      token: confirmToken,
      userId: registeredUser.id,
    });
    await confirmTokenDocument.save();
    await sendAuthorizationMessage(confirmToken, email);
    res.status(200).json({ message: "success" });
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
});

authRouter.post("/confirm-user", async ({ body: { token } }: ConfirmUserRequest, res) => {
  try {
    const existedToken: ConfirmToken = await ConfirmTokenModel.findOne({ token });

    if (!existedToken) {
      res.status(403).json({ message: "This token does not exist" });
      return;
    }
    await UserModel.findByIdAndUpdate(existedToken.userId, { isConfirmed: true });
    await ConfirmTokenModel.findOneAndRemove({ token });

    res.status(200).json({ message: "success" });
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
});

authRouter.post("/login", async ({ body: { login, password } }: LoginRequest, res) => {
  try {
    const user: User = await UserModel.findOne({ login });

    if (!user) {
      res.status(403).json({ message: "User does not exist " });
      return;
    }
    if (!user.isConfirmed) {
      res.status(403).json({ message: "User does not confirmed" });
      return;
    }

    const isEqual = await compare(password, user.password);
    if (!isEqual) {
      res.status(403).json({ message: "Password is incorrect" });
      return;
    }

    const { accessToken, refreshToken } = createTokens(user.id);
    setTokensIntoHeader(accessToken, refreshToken, res);

    await RefreshTokenModel.findOneAndUpdate({ userId: user.id }, { token: refreshToken });
    res.status(200).json({ message: "success" });
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
});

authRouter.post("/logout", (req, res) => {
  try {
    const userAuthId = getAuthenticatedUserId(req.cookies.accessToken || "");
    if (userAuthId) {
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("accessToken", "", {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
        }),
      );
    } else {
      res.status(403).json({ message: "Your are not authorized" });
    }
    res.status(200).json({ message: "success" });
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
});

authRouter.post("/update-refresh-token", async (req, res) => {
  try {
    const userAuthId = getAuthenticatedUserId(req.cookies.accessToken || "");

    const token = await RefreshTokenModel.findOne({ token: req.cookies.refreshToken });
    if (!token) {
      res.status(401).json({ message: "Your refresh token expired" });
    }

    const { accessToken, refreshToken } = createTokens(userAuthId);
    setTokensIntoHeader(accessToken, refreshToken, res);

    await RefreshTokenModel.findOneAndUpdate({ userId: userAuthId }, { token: refreshToken });
    res.status(200).json({ message: "success" });
  } catch (e) {
    res.status(e.status).json({ message: "failed" });
  }
});
