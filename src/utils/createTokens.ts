import jwt from "jsonwebtoken";
import { SECRET_ACCESS_KEY, SECRET_REFRESH_KEY } from "../secretKeys";

export const createTokens = (id: string) => {
  const accessToken = jwt.sign({ id }, SECRET_ACCESS_KEY, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ id }, SECRET_REFRESH_KEY, {
    expiresIn: "1w",
  });
  return { accessToken, refreshToken };
};
