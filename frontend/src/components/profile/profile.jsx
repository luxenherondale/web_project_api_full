import React from "react";
import avatar from "../../images/fotoperfil.png";
import vector from "../../images/vector.png";

function Profile() {
  return (
    <section className="profile">
      <div className="profile__image-container">
        <img src={avatar} className="profile__image" alt="fotodeperfil" />
      </div>
      <div className="profile__info">
        <h1 className="profile__name" id="displayName">
          Jaques Cousteau
        </h1>
        <p className="profile__description" id="displayJob">
          Explorador
        </p>
      </div>
      <button className="profile__edit-button" id="btn-open-popup">
        <img src={vector} alt="lapiz editor de nombre" />
      </button>
      <button className="profile__add-button" id="add-button-card">
        {/* <img src="/images/AddButton.png" alt="boton agregar contenido" /> */}
      </button>
    </section>
  );
}

export default Profile;
