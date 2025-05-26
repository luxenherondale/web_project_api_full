const Card = require("../models/card");

// Obtener todas las tarjetas
const getCards = async (req, res) => {
  try {
    const cards = await Card.find({}).populate("owner");
    res.send(cards);
  } catch (err) {
    res.status(500).send({ message: "Error al obtener las tarjetas" });
  }
};

// Crear una nueva tarjeta
const createCard = async (req, res) => {
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
      res.status(400).send({ message: "Datos de tarjeta inválidos" });
    } else {
      res.status(500).send({ message: "Error al crear la tarjeta" });
    }
  }
};

// Eliminar una tarjeta
const deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      return res.status(404).send({ message: "Tarjeta no encontrada" });
    }
    if (card.owner.toString() !== req.user._id) {
      return res
        .status(403)
        .send({ message: "No autorizado para eliminar esta tarjeta" });
    }
    await card.deleteOne();
    res.send({ message: "Tarjeta eliminada" });
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).send({ message: "ID de tarjeta inválido" });
    } else {
      res.status(500).send({ message: "Error al eliminar la tarjeta" });
    }
  }
};

// Dar like a una tarjeta
const likeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    ).populate("owner");

    if (!card) {
      return res.status(404).send({ message: "Tarjeta no encontrada" });
    }
    res.send(card);
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).send({ message: "ID de tarjeta inválido" });
    } else {
      res.status(500).send({ message: "Error al dar like a la tarjeta" });
    }
  }
};

// Quitar like de una tarjeta
const dislikeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    ).populate("owner");

    if (!card) {
      return res.status(404).send({ message: "Tarjeta no encontrada" });
    }
    res.send(card);
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).send({ message: "ID de tarjeta inválido" });
    } else {
      res.status(500).send({ message: "Error al quitar like de la tarjeta" });
    }
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
