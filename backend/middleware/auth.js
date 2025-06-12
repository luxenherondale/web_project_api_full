const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../utils/errors");

const JWT_SECRET = process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'clave-secreta';

module.exports = (req, res, next) => {
  // Saltar autenticacion en caso de peticiones OPTIONS
  if (req.method === 'OPTIONS') {
    return next();
  }

  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Autorización requerida'));
  }

  const token = authorization.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return next(new UnauthorizedError('Token inválido o expirado'));
  }
};
