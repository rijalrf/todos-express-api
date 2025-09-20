import bcrypt, { genSalt } from "bcrypt";
import ApiError from "./ApiError.js";

export const hashPassword = async (planPassword) => {
  try {
    const salt = 10;
    const hashedPassword = await bcrypt.hash(planPassword, salt);
    return hashedPassword;
  } catch (error) {
    throw Error("gagal hash password");
  }
};

export const comparePassword = async (planPassword, encryptedPassword) => {
  try {
    const isMatch = await bcrypt.compare(planPassword, encryptedPassword);
    return isMatch;
  } catch (error) {
    throw Error("gagal compare password");
  }
};
