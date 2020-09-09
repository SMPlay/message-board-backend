import cookie from "cookie";
import { Response } from "express";

export const setTokensIntoHeader = (accessToken: string, refreshToken: string, res: Response) => {
  res.setHeader(
    "Set-Cookie",
    [
      cookie.serialize("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3600,
        path: "/",
      }), cookie.serialize("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 25200,
        path: "/",
      }),
    ],
  );
};
