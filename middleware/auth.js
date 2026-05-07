function auth(req, res, next) {
  const username = req.headers.username;

  if (!username) {
    return res.status(401).json({
      msg: "No autorizado"
    });
  }

  req.username = username;

  next();
}

module.exports = auth;