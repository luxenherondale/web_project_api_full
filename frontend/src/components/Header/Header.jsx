import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../images/header.png";
import AuthContext from "../../contexts/AuthContext";

function Header() {
  const location = useLocation();
  const { loggedIn, userEmail, handleSignOut } = useContext(AuthContext);

  return (
    <header className="header">
      <img src={logo} className="header__logo" alt="Logo aroundTheUSA" />
      <div className="header__auth-container">
        {loggedIn ? (
          <>
            <p className="header__email">{userEmail}</p>
            <button className="header__logout" onClick={handleSignOut}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            {location.pathname === "/signin" && (
              <Link to="/signup" className="header__auth-link">
                Regístrate
              </Link>
            )}
            {location.pathname === "/signup" && (
              <Link to="/signin" className="header__auth-link">
                Iniciar sesión
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
