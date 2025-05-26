import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { handleLogin } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(formData)
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        console.error("Error al iniciar sesión:", err);
      });
  };

  return (
    <div className="auth">
      <h2 className="auth__title">Inicia sesión</h2>
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
          Iniciar sesión
        </button>
      </form>
      <p className="auth__text">
        ¿Aún no eres miembro?{" "}
        <Link to="/signup" className="auth__link">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}

export default Login;
