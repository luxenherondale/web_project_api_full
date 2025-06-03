const errorHandler = (err, req, res, next) => {

  const statusCode = err.statusCode || 500;

  // Mensaje predeterminado para errores del servidor
  const message = statusCode === 500
    ? 'Se produjo un error en el servidor'
    : err.message;

  console.error(`Error ${statusCode}: ${err.message}`);
  console.error(err.stack);

  res.status(statusCode).send({
    message,

    ...(process.env.NODE_ENV !== 'production' && { error: err.stack }),
  });
};

module.exports = errorHandler;
