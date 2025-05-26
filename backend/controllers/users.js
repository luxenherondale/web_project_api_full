const User = require("../models/user");

// Controlador para obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).orFail(() => {
      const error = new Error("No se encontraron usuarios");
      error.statusCode = 404;
      throw error;
    });
    res.send(users);
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).send({ message: err.message });
    }
    return res.status(500).send({
      message: "Error al obtener los usuarios",
      error: err.message,
    });
  }
};

// Controlador para obtener un usuario específico
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).orFail(() => {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    });

    res.send(user);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).send({
        message: "ID de usuario inválido",
        error: err.message,
      });
    }
    if (err.statusCode === 404) {
      return res.status(404).send({ message: err.message });
    }
    return res.status(500).send({
      message: "Error al obtener el usuario",
      error: err.message,
    });
  }
};

// Controlador para crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    const user = await User.create({ name, about, avatar });
    res.status(201).send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send({
        message: "Datos de usuario inválidos",
        error: err.message,
      });
    }
    return res.status(500).send({
      message: "Error al crear el usuario",
      error: err.message,
    });
  }
};

// Controlador para actualizar el perfil
const updateProfile = async (req, res) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true }
    ).orFail(() => {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    });

    res.send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send({
        message: "Datos de actualización inválidos",
        error: err.message,
      });
    }
    if (err.statusCode === 404) {
      return res.status(404).send({ message: err.message });
    }
    return res.status(500).send({
      message: "Error al actualizar el usuario",
      error: err.message,
    });
  }
};

// Controlador para actualizar el avatar
const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true }
    ).orFail(() => {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    });

    res.send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send({
        message: "URL de avatar inválida",
        error: err.message,
      });
    }
    if (err.statusCode === 404) {
      return res.status(404).send({ message: err.message });
    }
    return res.status(500).send({
      message: "Error al actualizar el avatar",
      error: err.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
