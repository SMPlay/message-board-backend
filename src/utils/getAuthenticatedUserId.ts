import jwt from "jsonwebtoken";

import { SECRET_ACCESS_KEY } from "../secretKeys";

export const getAuthenticatedUserId = (token: string) => {
  if (!token || token === "") {
    return null;
  }
  const decodedToken = jwt.verify(token, SECRET_ACCESS_KEY);
  if (!decodedToken) {
    return null;
  }
  // @ts-ignore
  return decodedToken.id;
};
