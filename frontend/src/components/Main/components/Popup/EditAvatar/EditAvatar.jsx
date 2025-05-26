// EditAvatar.jsx - Componente para el formulario de editar avatar
import React, { useContext, useRef } from "react";
import CurrentUserContext from "../../../../../contexts/CurrentUserContext";

export default function EditAvatar({ onSubmit, closeButton, popupTitle }) {
  const { handleUpdateAvatar } = useContext(CurrentUserContext);

  const avatarUrlRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    handleUpdateAvatar({
      avatar: avatarUrlRef.current.value,
    });
  };

  return (
    <form className="profile__form-edit form" onSubmit={handleSubmit}>
      {closeButton}
      {popupTitle}
      <fieldset className="form__fieldset fieldset">
        <label className="form__label" htmlFor="avatar-url"></label>
        <input
          className="form__input"
          type="url"
          id="avatar-url"
          placeholder="Enlace a la nueva foto de perfil"
          required
          ref={avatarUrlRef}
        />
        <span id="avatar-url-error" className="forminput-error"></span>

        <button className="buttonsave" type="submit" id="avatarbuttonsave">
          Guardar
        </button>
      </fieldset>
    </form>
  );
}
