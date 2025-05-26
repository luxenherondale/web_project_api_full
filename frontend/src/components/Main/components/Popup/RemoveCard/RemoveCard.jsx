// RemoveCard.jsx - Componente para confirmar eliminación de tarjeta
import React from "react";

export default function RemoveCard({
  onSubmit,
  closeButton,
  popupTitle,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="card__form-delete form" onSubmit={handleSubmit}>
      {closeButton}
      {popupTitle}
      <fieldset className="form__fieldset fieldset">
        <button
          className="buttonsave popup__confirm-button"
          type="submit"
          id="confirm-delete"
        >
          Sí
        </button>
      </fieldset>
    </form>
  );
}
