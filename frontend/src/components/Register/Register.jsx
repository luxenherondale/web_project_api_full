import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { handleRegister } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleRegister(formData);
  };

  return (
    <div className="auth">
      <h2 className="auth__title">Regístrate</h2>
      <form className="auth__form" onSubmit={handleSubmit}>
        <input
          className="auth__input"
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="auth__input"
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button className="auth__button" type="submit">
          Registrarse
        </button>
      </form>
      <p className="auth__text">
        ¿Ya eres miembro?{" "}
        <Link to="/signin" className="auth__link">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
}

export default Register;
