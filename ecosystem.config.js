module.exports = {
  apps: [
    {
      name: "around-backend",
      script: "./backend/app.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        JWT_SECRET: "tu-clave-secreta-aqui" // Reemplazar con una clave segura en producción
      },
      instances: "max", // Utiliza tantos núcleos como estén disponibles
      exec_mode: "cluster", // Permite múltiples instancias
      max_memory_restart: "300M", // Reinicia si se excede el uso de memoria
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      restart_delay: 3000, // Espera 3 segundos antes de reiniciar
      max_restarts: 10, // Máximo número de reinicios
      autorestart: true, // Reinicia automáticamente si se cae
    }
  ]
};
