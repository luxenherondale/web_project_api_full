const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/users");
const cardsRouter = require("./routes/cards");

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

// Middleware de autorización temporal
app.use((req, res, next) => {
  req.user = {
    _id: "68113b5d7e94ac2049a2473d", // ID GENERADO DE EJEMPLO
  };
  next();
});

// Uso de las rutas
app.use("/users", usersRouter);
app.use("/cards", cardsRouter);

// Manejo de rutas no existentes
app.use((req, res) => {
  res.status(404).send({ message: "Recurso solicitado no encontrado" });
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
