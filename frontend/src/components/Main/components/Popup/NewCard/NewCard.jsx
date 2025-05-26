// NewCard.jsx - Componente para el formulario de añadir una nueva tarjeta
import React, { useState } from "react";

export default function NewCard({ onSubmit, closeButton, popupTitle }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: title, link: url });
  };

  return (
    <form className="card__form-add form" onSubmit={handleSubmit}>
      {closeButton}
      {popupTitle}
      <fieldset className="form__fieldset fieldset">
        <label className="form__label" htmlFor="title"></label>
        <input
          className="form__input"
          type="text"
          id="title"
          placeholder="Titulo"
          minLength="2"
          maxLength="30"
          required
          value={title}
          onChange={handleTitleChange}
        />
        <span id="title-error" className="forminput-error"></span>

        <label className="form__label" htmlFor="url"></label>
        <input
          className="form__input"
          type="url"
          id="url"
          placeholder="Enlace a la imagen"
          required
          value={url}
          onChange={handleUrlChange}
        />
        <span id="url-error" className="forminput-error"></span>

        <button className="buttonsave" type="submit" id="cardbuttonsave">
          Crear
        </button>
      </fieldset>
    </form>
  );
}
