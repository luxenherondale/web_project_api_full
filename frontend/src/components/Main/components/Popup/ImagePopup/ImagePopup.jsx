// ImagePopup.jsx - Componente especial para mostrar imágenes
import React from "react";

export default function ImagePopup({ isOpen, onClose, card }) {
  return (
    <div className={`popup__space-image ${isOpen ? "popup_opened" : ""}`}>
      <div
        className={`popup__conteiner-image ${isOpen ? "popup_opened" : ""}`}
        id="image-popup"
      >
        <button
          className="image__close"
          id="close-image-popup"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        {/* Corregimos el atributo src para que nunca sea una cadena vacía */}
        <img
          src={card && card.link ? card.link : null}
          alt={card && card.name ? card.name : ""}
          className="popup__image"
        />
        <p className="popup__caption">{card ? card.name : ""}</p>
      </div>
    </div>
  );
}
