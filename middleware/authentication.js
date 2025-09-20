// auth header api key check middleware
export const authAPIKey = (req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({
      sucess: false,
      message: "Unauthorized",
    });
  }
};
