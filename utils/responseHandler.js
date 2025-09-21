import logger from "../middleware/logger.js";

const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: true,
    message: message,
  };
  if (data) {
    response.data = data;
  }
  if (meta) {
    response.meta = meta;
  }
  logger.info(message);
  return res.status(statusCode).json(response);
};

export default sendSuccess;
