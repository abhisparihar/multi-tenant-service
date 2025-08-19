import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: "info", // default log level
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }), // capture error stack traces
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, message, timestamp, stack }) => {
                    return stack
                        ? `[${timestamp}] ${level}: ${message}\n${stack}`
                        : `[${timestamp}] ${level}: ${message}`;
                })
            ),
        }),
        new transports.File({ filename: "logs/error.log", level: "error" }),
        new transports.File({ filename: "logs/combined.log" }),
    ],
});

// For unhandled errors
logger.stream = {
    write: (message) => logger.info(message.trim()),
};

export default logger;
