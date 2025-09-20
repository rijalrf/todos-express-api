import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info", // Level log default
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json() // Format log dalam bentuk JSON
  ),
  transports: [
    // Transport untuk mencatat log ke konsol
    new transports.Console({
      format: format.combine(
        format.colorize(), // Beri warna pada log di konsol
        format.simple() // Format yang lebih mudah dibaca di konsol
      ),
    }),

    // Transport untuk mencatat log dengan level 'error' ke file error.log
    new transports.File({ filename: "error.log", level: "error" }),

    // Transport untuk mencatat semua log ke file combined.log
    new transports.File({ filename: "combined.log" }),
  ],
});

export default logger;
