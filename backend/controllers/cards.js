const Card = require("../models/card");
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError
} = require("../utils/errors");

// Obtener todas las tarjetas
const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({}).populate("owner");
    res.send(cards);
  } catch (err) {
    next(err);
  }
};

// Crear una nueva tarjeta
const createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const card = await Card.create({
      name,
      link,
      owner: req.user._id,
    });
    res.status(201).send(card);
  } catch (err) {
    if (err.name === "ValidationError") {
      next(new BadRequestError("Datos de tarjeta inválidos"));
      return;
    }
    next(err);
  }
};

// Eliminar una tarjeta
const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      throw new NotFoundError("Tarjeta no encontrada");
    }
    if (card.owner.toString() !== req.user._id) {
      throw new ForbiddenError("No autorizado para eliminar esta tarjeta");
    }
    await card.deleteOne();
    res.send({ message: "Tarjeta eliminada" });
  } catch (err) {
    if (err.name === "CastError") {
      next(new BadRequestError("ID de tarjeta inválido"));
      return;
    }
    next(err);
  }
};

// Dar like a una tarjeta
const likeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    ).populate("owner");

    if (!card) {
      throw new NotFoundError("Tarjeta no encontrada");
    }
    res.send(card);
  } catch (err) {
    if (err.name === "CastError") {
      next(new BadRequestError("ID de tarjeta inválido"));
      return;
    }
    next(err);
  }
};

// Quitar like de una tarjeta
const dislikeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    ).populate("owner");

    if (!card) {
      throw new NotFoundError("Tarjeta no encontrada");
    }
    res.send(card);
  } catch (err) {
    if (err.name === "CastError") {
      next(new BadRequestError("ID de tarjeta inválido"));
      return;
    }
    next(err);
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
