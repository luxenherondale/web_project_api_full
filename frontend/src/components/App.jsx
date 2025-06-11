import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "../App.css";
import "../index.css";
import Header from "./Header/Header";
import Main from "./Main/Main";
import Footer from "./Footer/Footer";
import Login from "./Login/Login";
import Register from "./Register/Register";
import InfoTooltip from "./InfoTooltip/InfoTooltip";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import api from "../utils/api";
import * as auth from "../utils/auth";
import CurrentUserContext from "../contexts/CurrentUserContext";
import AuthContext from "../contexts/AuthContext";

function App() {
  const [currentUser, setCurrentUser] = useState({
    name: "",
    about: "",
    avatar: "",
    _id: "",
    email: "",
  });

  // Estado para auth
  const [loggedIn, setLoggedIn] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const navigate = useNavigate();

  // Estado para las tarjetas (elevado desde Main)
  const [cards, setCards] = useState([]);

  // Estado para manejar popups
  const [popup, setPopup] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);

  // Comprueba el token al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem("token");
    // Verificar si estamos en una ruta de autenticación
    const path = window.location.pathname;
    const isAuthRoute = path === "/signin" || path === "/signup";
    
    // Si hay un token y no estamos en una ruta de autenticación, verificarlo
    if (token) {
      auth
        .checkToken(token)
        .then((res) => {
          // La API de registro puede devolver estructuras diferentes
          if (res) {
            setLoggedIn(true);
            // Manejar diferentes estructuras de respuesta
            setUserEmail(res.data ? res.data.email : res.email);
            
            // Solo redirigir si estamos en una ruta de autenticación
            if (isAuthRoute) {
              navigate("/");
            }
          }
        })
        .catch((err) => {
          console.error("Error al verificar token:", err);
          localStorage.removeItem("token");
          // Si hay error de autenticación y no estamos en una ruta de autenticación,
          // redirigir a signin
          if (!isAuthRoute) {
            navigate("/signin");
          }
        });
    } else if (!isAuthRoute) {
      // Si no hay token y no estamos en una ruta de autenticación, redirigir a signin
      navigate("/signin");
    }
  }, [navigate]);


  // Funciones para manejar popups
  function handleOpenPopup(popupContent) {
    setPopup(popupContent);
  }

  function handleClosePopup() {
    setPopup(null);
    setSelectedCard(null);
  }

  // Cerrar InfoTooltip
  function closeInfoTooltip() {
    setIsInfoTooltipOpen(false);
    if (isSuccessful) {
      navigate("/signin");
    }
  }

  // Manejo de registro
  const handleRegister = (data) => {
    auth
      .register(data)
      .then(() => {
        setIsSuccessful(true);
        setIsInfoTooltipOpen(true);
      })
      .catch((err) => {
        console.error("Error al registrar usuario:", err);
        setIsSuccessful(false);
        setIsInfoTooltipOpen(true);
      });
  };

  // Manejo de login
  const handleLogin = (data) => {
    return auth
      .login(data)
      .then((res) => {
        if (res.token) {
          setLoggedIn(true);
          setUserEmail(data.email);
          navigate("/");
          return res;
        }
      })
      .catch((err) => {
        console.error("Error al iniciar sesión:", err);
        setIsSuccessful(false);
        setIsInfoTooltipOpen(true);
        throw err; // Para manejar el error en el componente Login
      });
  };

  // Manejo de logout
  const handleSignOut = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUserEmail("");
    navigate("/signin");
  };

  // Función para actualizar datos del usuario
  const handleUpdateUser = (data) => {
    api
      .updateUserData(data)
      .then((response) => {
        // Verificar si la respuesta contiene data o si ya es el objeto actualizado
        const newData = response.data || response;
        setCurrentUser({ ...currentUser, ...newData });
        handleClosePopup(); // Cierra el popup después de actualizar
      })
      .catch((err) => {
        console.error("Error al actualizar datos del usuario:", err);
      });
  };

  // Función para actualizar el avatar del usuario
  const handleUpdateAvatar = (data) => {
    api
      .updateUserAvatar(data)
      .then((response) => {
        // Verificar si la respuesta contiene data o si ya es el objeto actualizado
        const newData = response.data || response;
        setCurrentUser({ ...currentUser, ...newData });
        handleClosePopup(); // Cierra el popup después de actualizar
      })
      .catch((err) => {
        console.error("Error al actualizar avatar del usuario:", err);
      });
  };

  // Función para añadir nueva tarjeta
  const handleAddPlaceSubmit = (cardData) => {
    api
      .createCard(cardData)
      .then((response) => {
        // Verificamos si la respuesta contiene data o si la respuesta ya es la tarjeta
        const newCard = response.data || response;

        // Añadir propiedad isLiked
        const newCardWithLikeStatus = {
          ...newCard,
          isLiked: false, // Una nueva tarjeta nunca tendrá like del usuario al crearla
        };

        setCards([newCardWithLikeStatus, ...cards]); // La nueva tarjeta aparece al principio
        handleClosePopup();
      })
      .catch((err) => {
        console.error("Error al crear tarjeta:", err);
      });
  };

  // Función para dar/quitar like a una tarjeta
  async function handleCardLike(card) {
    // Verifica si a esta tarjeta ya le ha dado like
    const isLiked = card.isLiked;

    try {
      // Envía una solicitud a la API y obtiene los datos actualizados de la tarjeta
      const response = await api.changeLikeCardStatus(card._id, !isLiked);

      // Verificamos si la respuesta contiene data o si ya es el objeto actualizado
      const updatedCard = response.data || response;

      // Asegurando de que la propiedad isLiked esté actualizada
      const newCard = {
        ...updatedCard,
        isLiked: !isLiked,
      };

      // Actualiza el estado de las tarjetas
      setCards((state) =>
        state.map((currentCard) =>
          currentCard._id === card._id ? newCard : currentCard
        )
      );
    } catch (error) {
      console.error("Error al actualizar estado del like:", error);
    }
  }

  // Función para eliminar una tarjeta
  function handleCardDelete(specificCardId) {
    const idToDelete = specificCardId || cardToDelete;
    if (idToDelete) {
      api
        .deleteCard(idToDelete)
        .then(() => {
          setCards(cards.filter((card) => card._id !== idToDelete));
          handleClosePopup();
          setCardToDelete(null);
        })
        .catch((err) => console.error("Error al eliminar tarjeta:", err));
    }
  }

  // Funcion para establecer cardToDelete
  function handleDeleteClick(cardId) {
    setCardToDelete(cardId);
  }

  // Cargar información inicial del usuario y tarjetas
  useEffect(() => {
    if (loggedIn) {
      // Cargar información del usuario usando la API principal
      api
        .getUserData()
        .then((userData) => {
          // Verificar la estructura de la respuesta
          const userInfo = userData.data || userData;

          if (userInfo) {
            setCurrentUser({
              ...userInfo,
              email: userEmail,
            });
          }
        })
        .catch((err) => {
          console.error("Error al cargar datos del usuario:", err);
        });
    }
  }, [loggedIn, userEmail]);

  // Efecto separado para cargar tarjetas una vez que tengamos el usuario
  useEffect(() => {
    if (loggedIn && currentUser._id) {
      // Cargar tarjetas iniciales
      api
        .getInitialCards()
        .then((response) => {
          // Verificar si la respuesta contiene .data o si ya es el array de tarjetas
          const cardsData = response.data || response;

          if (!Array.isArray(cardsData)) {
            console.error("Los datos de tarjetas no son un array", cardsData);
            return;
          }

          // Procesar las tarjetas para añadir el estado de likes
          const processedCards = cardsData.map((card) => {
            // Verificar si el array de likes existe y es un array
            const likesArray = Array.isArray(card.likes) ? card.likes : [];

            // Verificar si el usuario actual ha dado like
            const isLiked = likesArray.some(
              (like) => like && like._id === currentUser._id
            );

            return {
              ...card,
              isLiked,
            };
          });

          setCards(processedCards);
        })
        .catch((err) => console.error("Error al cargar tarjetas:", err));
    }
  }, [loggedIn, currentUser._id]);

  return (
    // las funciones y datos a través de los contextos
    <AuthContext.Provider
      value={{
        loggedIn,
        userEmail,
        handleLogin,
        handleRegister,
        handleSignOut,
      }}
    >
      <CurrentUserContext.Provider
        value={{
          currentUser,
          handleUpdateUser,
          handleUpdateAvatar,
        }}
      >
        <div className="page">
          <Header
            loggedIn={loggedIn}
            email={userEmail}
            onSignOut={handleSignOut}
          />

          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute
                  element={Main}
                  loggedIn={loggedIn}
                  cards={cards}
                  onCardLike={handleCardLike}
                  onCardDelete={handleDeleteClick}
                  onConfirmDelete={handleCardDelete}
                  onAddPlace={handleAddPlaceSubmit}
                  onUpdateUser={handleUpdateUser}
                  onOpenPopup={handleOpenPopup}
                  onClosePopup={handleClosePopup}
                  popup={popup}
                  selectedCard={selectedCard}
                  setSelectedCard={setSelectedCard}
                  cardToDelete={cardToDelete}
                />
              }
            />

            <Route
              path="/signup"
              element={
                loggedIn ? (
                  <Navigate to="/" replace />
                ) : (
                  <Register handleRegister={handleRegister} />
                )
              }
            />

            <Route
              path="/signin"
              element={
                loggedIn ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login handleLogin={handleLogin} />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {loggedIn && <Footer />}

          <InfoTooltip
            isOpen={isInfoTooltipOpen}
            onClose={closeInfoTooltip}
            isSuccess={isSuccessful}
          />
        </div>
      </CurrentUserContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
