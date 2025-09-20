import jwt from "jsonwebtoken";

export const createToken = (email, userId) => {
  const optionsAccessToken = {
    expiresIn: "1h",
  };
  const playload_access_token = {
    email: email,
    userId: userId,
  };
  const accessToken = jwt.sign(
    playload_access_token,
    process.env.JWT_SECRET_TOKEN,
    optionsAccessToken
  );
  const expiredIn = 3600;
  const refresh_token = createRefreshToken(email);
  const response = {
    access_token: accessToken,
    token_type: "bearer",
    expired: expiredIn,
    refresh_token: refresh_token,
  };
  return response;
};

export const createRefreshToken = (email) => {
  const optionsRefreshToken = {
    expiresIn: "7d",
  };
  const playload_refresh_token = {
    email: email,
  };
  const refrehToken = jwt.sign(
    playload_refresh_token,
    process.env.JWT_SECRET_REFRESH_TOKEN,
    optionsRefreshToken
  );
  return refrehToken;
};
