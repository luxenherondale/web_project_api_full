const express = require("express");
const {
  getUsers,
  getUserById,
  getCurrentUser,
  updateProfile,
  updateAvatar,
} = require("../controllers/users");
const {
  validateObjectId,
  validateUserUpdate,
  validateAvatarUpdate
} = require("../middleware/validation");

const router = express.Router();

// Rutas para operaciones básicas de usuarios
router.get("/", getUsers); // Obtener todos los usuarios
router.get("/me", getCurrentUser); // Obtener usuario actual
router.get("/:id", validateObjectId, getUserById); // Obtener un usuario específico

// Rutas para actualizar información del usuario
router.patch("/me", validateUserUpdate, updateProfile); // Actualizar perfil
router.patch("/me/avatar", validateAvatarUpdate, updateAvatar); // Actualizar avatar

module.exports = router;
