// Main.jsx corregido
import React, { useContext } from "react";

import Popup from "./components/Popup/Popup";
import EditProfile from "./components/Popup/EditProfile/EditProfile";
import NewCard from "./components/Popup/NewCard/NewCard";
import EditAvatar from "./components/Popup/EditAvatar/EditAvatar";
import RemoveCard from "./components/Popup/RemoveCard/RemoveCard";
import ImagePopup from "./components/Popup/ImagePopup/ImagePopup";
import Card from "./components/Card/Card";
import vectorIcon from "../../images/Vector.png";
import CurrentUserContext from "../../contexts/CurrentUserContext";

export default function Main({
  cards, // Recibimos las tarjetas como prop
  onCardLike, // Función para manejar likes
  onCardDelete, // Función para manejar eliminación de tarjeta
  onConfirmDelete, // Función para confirmar eliminación
  onAddPlace, // Función para añadir nueva tarjeta
  onUpdateUser,
  onOpenPopup,
  onClosePopup,
  popup,
  selectedCard,
  setSelectedCard,
}) {
  // Obtenemos el usuario actual del contexto
  const { currentUser, handleUpdateUser, handleUpdateAvatar } =
    useContext(CurrentUserContext);

  // Definimos los contenidos de los popups
  const editProfilePopup = {
    title: "Editar perfil",
    name: "edit-profile",
    children: <EditProfile onSubmit={handleUpdateUser} />,
  };

  const addCardPopup = {
    title: "Nuevo lugar",
    name: "add-card",
    children: <NewCard onSubmit={onAddPlace} />,
  };

  const editAvatarPopup = {
    title: "Cambiar foto de perfil",
    name: "profile-edit",
    children: <EditAvatar onSubmit={handleUpdateAvatar} />,
  };

  const deleteConfirmationPopup = {
    title: "¿Estás seguro/a?",
    name: "delete-confirmation",
    children: <RemoveCard onSubmit={onConfirmDelete} />,
  };

  // Manejadores de eventos específicos
  const handleEditProfileClick = () => {
    onOpenPopup(editProfilePopup);
  };

  const handleAddCardClick = () => {
    onOpenPopup(addCardPopup);
  };

  const handleEditAvatarClick = () => {
    onOpenPopup(editAvatarPopup);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleDeleteClick = (cardId) => {
    // Definimos los contenidos del popup con el cardId específico
    const specificDeleteConfirmationPopup = {
      title: "¿Estás seguro/a?",
      name: "delete-confirmation",
      children: <RemoveCard onSubmit={() => onConfirmDelete(cardId)} />,
    };

    onOpenPopup(specificDeleteConfirmationPopup);
  };
  return (
    <main className="main">
      {/* Sección del perfil */}
      <section className="profile">
        {/* Hacemos clic en el contenedor de imagen para editar el avatar */}
        <div
          className="profile__image-container"
          onClick={handleEditAvatarClick}
        >
          <img
            src={currentUser.avatar || null}
            alt="fotodeperfil"
            className="profile__image"
          />
        </div>
        <div className="profile__info">
          <h1 className="profile__name" id="displayName">
            {currentUser.name}
          </h1>
          <p className="profile__description" id="displayJob">
            {currentUser.about}
          </p>
        </div>
        <button
          className="profile__edit-button"
          id="btn-open-popup"
          onClick={handleEditProfileClick}
          type="button"
        >
          <img src={vectorIcon} alt="lapiz editor de nombre" />
        </button>
        <button
          className="profile__add-button"
          id="add-button-card"
          onClick={handleAddCardClick}
          type="button"
        >
          {/* <img src="/images/AddButton.png" alt="boton agregar contenido" /> */}
        </button>
      </section>

      {/* Sección de tarjetas */}
      <section className="card">
        <div className="card__conteiner">
          {cards.map((card) => (
            <Card
              key={card._id}
              card={card}
              onCardClick={handleCardClick}
              onCardLike={onCardLike}
              onCardDelete={handleDeleteClick}
              currentUserId={currentUser._id}
            />
          ))}
        </div>
      </section>

      {/* Renderizado del Popup según las instrucciones */}
      {popup && (
        <Popup
          isOpen={true}
          onClose={onClosePopup}
          title={popup.title}
          name={popup.name}
        >
          {popup.children}
        </Popup>
      )}

      {/* ImagePopup se maneja por separado */}
      <ImagePopup
        isOpen={selectedCard !== null}
        onClose={onClosePopup}
        card={selectedCard}
      />
    </main>
  );
}
