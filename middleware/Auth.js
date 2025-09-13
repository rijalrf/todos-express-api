const auth = (req, res, next) => {
  const token = req.header("x-api-key");
  if (!token || token !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
  next();
};

export default auth;
