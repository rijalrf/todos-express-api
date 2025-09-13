// auth header api key check middleware
const auth = (req, res, next) => {
  const apiKey = req.header("api_key");
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default auth;
