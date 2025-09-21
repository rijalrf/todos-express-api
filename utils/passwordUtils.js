import bcrypt from "bcrypt";

export const hashPassword = async (planPassword) => {
  const salt = 10;
  const hashedPassword = await bcrypt.hash(planPassword, salt);
  return hashedPassword;
};

export const comparePasswod = async (planPassword, encryptedPassword) => {
  const isMatch = await bcrypt.compare(planPassword, encryptedPassword);
  return isMatch;
};
