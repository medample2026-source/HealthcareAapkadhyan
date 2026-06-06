const isProduction = process.env.NODE_ENV === "production";

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const sendRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", refreshCookieOptions);
};

module.exports = {
  refreshCookieOptions,
  sendRefreshCookie,
  clearRefreshCookie,
};
