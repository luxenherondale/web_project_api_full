// Utilidad para la validación de formularios

// Reglas de validación
const validationRules = {
  email: {
    required: true,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Por favor ingresa un correo electrónico válido.",
  },
  password: {
    required: true,
    minLength: 8,
    message: "La contraseña debe tener al menos 8 caracteres.",
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 40,
    message: "El nombre debe tener entre 2 y 40 caracteres.",
  },
  about: {
    required: true,
    minLength: 2,
    maxLength: 200,
    message: "La descripción debe tener entre 2 y 200 caracteres.",
  },
  url: {
    required: true,
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    message: "Por favor ingresa una URL válida.",
  },
};

// Función para validar un campo
export const validateField = (name, value) => {
  const rule = validationRules[name];

  if (!rule) return { valid: true, message: "" };

  if (rule.required && !value) {
    return { valid: false, message: "Este campo es obligatorio." };
  }

  if (rule.minLength && value.length < rule.minLength) {
    return {
      valid: false,
      message: `Este campo debe tener al menos ${rule.minLength} caracteres.`,
    };
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    return {
      valid: false,
      message: `Este campo debe tener como máximo ${rule.maxLength} caracteres.`,
    };
  }

  if (rule.pattern && !rule.pattern.test(value)) {
    return { valid: false, message: rule.message };
  }

  return { valid: true, message: "" };
};

// Hook personalizado para la validación de formularios
export const useFormValidator = (initialValues = {}) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [isValid, setIsValid] = React.useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues({
      ...values,
      [name]: value,
    });

    const validation = validateField(name, value);

    setErrors({
      ...errors,
      [name]: validation.message,
    });

    // Comprueba si todos los campos son válidos
    const formIsValid = Object.keys(values).every((key) => {
      if (key === name) {
        return validation.valid;
      }
      return !errors[key];
    });

    setIsValid(formIsValid);
  };

  return { values, errors, isValid, handleChange, setValues, setErrors };
};
