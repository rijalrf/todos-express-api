import ApiError from "../utils/ApiError.js";
import { verifAccessToken } from "../utils/jwt.js";

// auth header api key check middleware
export const authAPIKey = (req, res, next) => {
  const token = req.header("authorization");
  if (token) {
    try {
      verifAccessToken(token);
      next();
    } catch (error) {
      next(new ApiError(401, "token invalid", error));
    }
  } else {
    res.status(401).json({
      sucess: false,
      message: "Unauthorized",
    });
  }

  // const apiKey = req.header("x-api-key");
  // if (apiKey && apiKey === process.env.API_KEY) {
  //   next();
  // } else {
  //   res.status(401).json({
  //     sucess: false,
  //     message: "Unauthorized",
  //   });
  // }
};
