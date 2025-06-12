const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errors } = require("celebrate");
const usersRouter = require("./routes/users");
const cardsRouter = require("./routes/cards");
const signinRouter = require("./routes/signin");
const signupRouter = require("./routes/signup");
const healthRouter = require("./routes/health");
const { login, createUser } = require("./controllers/users");
const auth = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");
const { requestLogger, errorLogger } = require("./utils/logger");
const { NotFoundError } = require("./utils/errors");
const {
  validateUserCreation,
  validateLogin,
} = require("./middleware/validation");

const app = express();
const { PORT = 3000 } = process.env;

// Conectar a MongoDB
const { MONGODB_URI = "mongodb://localhost:27017/aroundb" } = process.env;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Middleware para parsear JSON
app.use(express.json());

// Middleware CORS
app.use(
  cors({
    origin: [
      "https://www.arounadaly.mooo.com",
      "http://localhost:3000",
      "https://arounadaly.mooo.com",
    ],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Logger de solicitudes
app.use(requestLogger);

// Rutas públicas que no requieren autenticación
app.use('/signin', signinRouter);
app.use('/signup', signupRouter);
app.use('/health', healthRouter);

// Rutas protegidas que usan middleware
app.use('/users', auth, usersRouter);
app.use('/cards', auth, cardsRouter);

// Manejo de rutas no existentes
app.use((req, res, next) => {
  next(new NotFoundError("Recurso solicitado no encontrado"));
});

// Ruta de prueba para crash del servidor
app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("El servidor va a caer");
  }, 0);
});

// Logger de errores
app.use(errorLogger);

// Manejador de errores de celebrate
app.use(errors());

// Manejador de errores centralizado
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});

module.exports = app;
