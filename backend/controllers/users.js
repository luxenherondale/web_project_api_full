const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError
} = require("../utils/errors");

const JWT_SECRET = process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'clave-secreta';

// Controlador para login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new UnauthorizedError("Correo electrónico o contraseña incorrectos");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Correo electrónico o contraseña incorrectos");
    }

    const token = jwt.sign(
      { _id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({ token });
  } catch (err) {
    next(err);
  }
};

// Controlador para obtener usuario actual
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    res.send(user);
  } catch (err) {
    next(err);
  }
};

// Controlador para obtener todos los usuarios
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    next(err);
  }
};

// Controlador para obtener un usuario específico
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    res.send(user);
  } catch (err) {
    if (err.name === "CastError") {
      next(new BadRequestError("ID de usuario inválido"));
      return;
    }
    next(err);
  }
};

// Controlador para crear un nuevo usuario (registro)
const createUser = async (req, res, next) => {
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
      next(new BadRequestError("Datos de usuario inválidos"));
      return;
    }
    if (err.code === 11000) {
      next(new ConflictError("El correo electrónico ya está registrado"));
      return;
    }
    next(err);
  }
};

// Controlador para actualizar el perfil
const updateProfile = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    res.send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      next(new BadRequestError("Datos de actualización inválidos"));
      return;
    }
    next(err);
  }
};

// Controlador para actualizar el avatar
const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    res.send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      next(new BadRequestError("URL de avatar inválida"));
      return;
    }
    next(err);
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
