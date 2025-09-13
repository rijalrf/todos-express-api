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

  return res.status(statusCode).json(response);
};

export default sendSuccess;
