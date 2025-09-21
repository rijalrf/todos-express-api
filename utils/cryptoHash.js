import crypto from "crypto";
import ApiError from "./ApiError.js";

export const cryptoHash = (planText) => {
  const hash = crypto
    .createHmac("sha256", process.env.HASH_SECRET)
    .update(planText)
    .digest("hex");

  return hash;
};
