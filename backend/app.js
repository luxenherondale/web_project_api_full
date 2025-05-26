const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/users");
const cardsRouter = require("./routes/cards");
const { login, createUser } = require("./controllers/users");
const auth = require("./middlewares/auth");

const app = express();
const { PORT = 3000 } = process.env;

// Conectar a MongoDB
mongoose
  .connect("mongodb://localhost:27017/aroundb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Middleware para parsear JSON
app.use(express.json());

// Rutas públicas (sin autenticación)
app.post("/signin", login);
app.post("/signup", createUser);

// Middleware de autenticación para rutas protegidas
app.use(auth);

// Rutas protegidas
app.use("/users", usersRouter);
app.use("/cards", cardsRouter);

// Manejo de rutas no existentes
app.use((req, res) => {
  res.status(404).send({ message: "Recurso solicitado no encontrado" });
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
