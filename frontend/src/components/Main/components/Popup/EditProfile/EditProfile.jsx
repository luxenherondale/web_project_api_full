// EditProfile.jsx - Componente para el formulario de editar perfil
import React, { useState, useContext } from "react";
import CurrentUserContext from "../../../../../contexts/CurrentUserContext";

export default function EditProfile({ onSubmit, closeButton, popupTitle }) {
  const { currentUser, handleUpdateUser } = useContext(CurrentUserContext);

  const [name, setName] = useState(currentUser.name || "");
  const [about, setAbout] = useState(currentUser.about || "");

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleAboutChange = (event) => {
    setAbout(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Usamos handleUpdateUser desde el contexto en lugar de onSubmit de props
    handleUpdateUser({ name, about });
  };

  return (
    <form className="profile__form-edit form" onSubmit={handleSubmit}>
      {closeButton}
      {popupTitle}
      <fieldset className="form__fieldset fieldset">
        <label className="form__label" htmlFor="name"></label>
        <input
          className="form__input"
          type="text"
          id="name"
          placeholder="Nombre"
          minLength="2"
          maxLength="40"
          required
          value={name}
          onChange={handleNameChange}
        />
        <span id="name-error" className="forminput-error"></span>

        <label className="form__label" htmlFor="job"></label>
        <input
          className="form__input"
          type="text"
          id="job"
          placeholder="Acerca de mi"
          minLength="2"
          maxLength="200"
          required
          value={about}
          onChange={handleAboutChange}
        />
        <span id="job-error" className="forminput-error"></span>

        <button className="buttonsave" type="submit" id="buttonsave">
          Guardar
        </button>
      </fieldset>
    </form>
  );
}
