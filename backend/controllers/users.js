const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Controlador para login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .send({ message: "Correo electrónico o contraseña incorrectos" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ message: "Correo electrónico o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { _id: user._id },
      "clave-secreta", // En producción usar process.env.JWT_SECRET
      { expiresIn: "7d" }
    );

    res.send({ token });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error en el servidor", error: err.message });
  }
};

// Controlador para obtener usuario actual
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).orFail(() => {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    });
    res.send(user);
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).send({ message: err.message });
    }
    return res.status(500).send({
      message: "Error al obtener el usuario",
      error: err.message,
    });
  }
};

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

// Controlador para crear un nuevo usuario (registro)
const createUser = async (req, res) => {
  try {
    const { name, about, avatar, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });

    // No devolver la contraseña en la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).send(userResponse);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send({
        message: "Datos de usuario inválidos",
        error: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(409).send({
        message: "El correo electrónico ya está registrado",
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
  login,
  getCurrentUser,
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
