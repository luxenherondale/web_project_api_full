// Popup.jsx - Componente base para todos los popups (refactorizado)
import React from "react";

export default function Popup({ isOpen, onClose, title, name, children }) {
  let popupClass = "";
  let containerClass = "";
  let closeButtonClass = "";
  let titleClass = "";

  switch (name) {
    case "edit-profile":
      popupClass = "overlay";
      containerClass = "popup__container";
      closeButtonClass = "form__close-button";
      titleClass = "profile__form-tittle";
      break;
    case "add-card":
      popupClass = "addcard";
      containerClass = "popup_card";
      closeButtonClass = "form__close-button-card";
      titleClass = "card__form-tittle";
      break;
    case "delete-confirmation":
      popupClass = "delete-confirmation";
      containerClass = "popup_card";
      closeButtonClass = "form__close-button-card";
      titleClass = "card__form-tittle";
      break;
    case "profile-edit":
      popupClass = "avatar-edit overlay";
      containerClass = "popup_card form__fieldset card__form-add";
      closeButtonClass = "form__close-button-card";
      titleClass = "card__form-tittle";
      break;
    default:
      popupClass = "overlay";
      containerClass = "popup__container";
      closeButtonClass = "form__close-button";
      titleClass = "profile__form-tittle";
  }

  const popupId =
    name === "edit-profile"
      ? "popup-editprofile"
      : name === "add-card"
      ? "popup-addcard"
      : name === "delete-confirmation"
      ? "popup-deletecard"
      : name === "profile-edit"
      ? "popup-avatar"
      : `popup-${name}`;

  const closeButtonId =
    name === "edit-profile"
      ? "btn-close-popup"
      : name === "add-card"
      ? "btn-close-popup-card"
      : name === "delete-confirmation"
      ? "btn-close-popup-deletecard"
      : name === "profile-edit"
      ? "btn-close-popup-avatar"
      : `btn-close-popup-${name}`;

  return (
    <div className={`${popupClass} ${isOpen ? "active" : ""}`} id={name}>
      <div className={containerClass} id={popupId}>
        {/* Inyectamos el botón de cierre y el título al componente hijo */}
        {React.cloneElement(children, {
          closeButton: (
            <div
              className={closeButtonClass}
              id={closeButtonId}
              onClick={onClose}
            ></div>
          ),
          popupTitle: title ? <h3 className={titleClass}>{title}</h3> : null,
        })}
      </div>
    </div>
  );
}
