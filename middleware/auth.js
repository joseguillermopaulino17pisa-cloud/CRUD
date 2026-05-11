const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {

    return res.status(401).json({
      msg: "Token requerido"
    });

  }

  try {

    const decoded = jwt.verify(
      token,
      "secreto123"
    );

    req.username = decoded.username;

    next();

  } catch {

    return res.status(401).json({
      msg: "Token inválido"
    });

  }

};