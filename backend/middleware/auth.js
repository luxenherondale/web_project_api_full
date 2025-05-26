const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Autorización requerida" });
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, "clave-secreta"); // todavia no se usa env por lo que se reemplazaaria con process.env.JWT_SECRET si uso .env
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).send({ message: "Token inválido o expirado" });
  }
};
