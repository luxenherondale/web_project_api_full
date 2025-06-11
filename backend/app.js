const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errors } = require("celebrate");
const usersRouter = require("./routes/users");
const cardsRouter = require("./routes/cards");
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

// Rutas públicas (sin autenticación)
app.post("/signin", validateLogin, login);
app.post("/signup", validateUserCreation, createUser);

// Ruta para verificar si el servidor está funcionando (útil para diagnóstico)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "El servidor está funcionando correctamente" });
});

// Ruta para obtener información sobre las rutas públicas disponibles
app.get("/public-routes", (req, res) => {
  res.status(200).json({
    message: "Rutas públicas disponibles",
    routes: [
      { path: "/signin", method: "POST", description: "Iniciar sesión" },
      { path: "/signup", method: "POST", description: "Registrar nuevo usuario" },
      { path: "/health", method: "GET", description: "Verificar estado del servidor" },
      { path: "/public-routes", method: "GET", description: "Obtener información sobre rutas públicas" }
    ]
  });
});

// Middleware de autenticación para rutas protegidas
app.use(auth);

// Rutas protegidas
app.use("/users", usersRouter);
app.use("/cards", cardsRouter);

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
