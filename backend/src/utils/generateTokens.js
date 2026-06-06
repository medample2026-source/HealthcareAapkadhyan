const jwt = require("jsonwebtoken");

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

const getAccessExpire = () =>
  process.env.JWT_ACCESS_EXPIRE || process.env.JWT_EXPIRE || "15m";

const getRefreshExpire = () => process.env.JWT_REFRESH_EXPIRE || "7d";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    getAccessSecret(),
    {
      expiresIn: getAccessExpire(),
    },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: getRefreshExpire(),
    },
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getAccessSecret,
};
