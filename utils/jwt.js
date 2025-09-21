import jwt from "jsonwebtoken";

export const createToken = (email, userId) => {
  const ACCESS_EXP = "15m";
  const REFRESH_EXP = "1m";

  const accessToken = jwt.sign(
    {
      email: email,
      userId: userId,
    },
    process.env.JWT_SECRET_ACCESS_TOKEN,
    {
      expiresIn: ACCESS_EXP,
      issuer: "api.todo",
      audience: "web",
    }
  );

  const refreshToken = jwt.sign(
    {
      email: email,
      userId: userId,
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
  };
};

export const verifAccessToken = (planToken) => {
  const accessToken = jwt.verify(
    planToken,
    process.env.JWT_SECRET_ACCESS_TOKEN
  );

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
