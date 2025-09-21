import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export const createToken = (email, userId) => {
  const ACCESS_EXP = "1m";
  const REFRESH_EXP = "1m";

  const accessToken = jwt.sign(
    {
      sub: userId,
      email,
    },
    process.env.JWT_SECRET_ACCESS_TOKEN,
    {
      expiresIn: ACCESS_EXP,
      issuer: "api.todo",
      audience: "web",
    }
  );
  const jti = randomUUID();
  const refreshToken = jwt.sign(
    {
      sub: userId,
      email,
      jti,
    },
    process.env.JWT_SECRET_REFRESH_TOKEN,
    {
      expiresIn: REFRESH_EXP,
      issuer: "api.todo",
      audience: "web",
    }
  );
  const accessExp = jwt.decode(accessToken).exp;
  const refreshExp = jwt.decode(refreshToken).exp;

  return {
    accessToken,
    accessExp,
    refreshToken,
    refreshExp,
    jti,
  };
};

export const verifAccessToken = (planToken) => {
  const token = planToken.split(" ")[1];
  const accessToken = jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN);

  return accessToken;
};
export const verifRefreshToken = (planToken) => {
  const refreshToken = jwt.verify(
    planToken,
    process.env.JWT_SECRET_REFRESH_TOKEN
  );
  return refreshToken;
};

export const decodeToken = (planToken) => {
  const decode = jwt.decode(planToken);
  return decode;
};
