import winston from "winston";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const transports = [
    new winston.transports.Console()
];

// In non-serverless environments (local dev or traditional VPS), attempt file logging
if (!isServerless) {
    try {
        const logDir = path.join(__dirname, "../logs");
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        transports.push(
            new winston.transports.File({
                filename: path.join(logDir, "app.log")
            })
        );
    } catch (err) {
        // If file logging fails (e.g. read-only filesystem), gracefully fallback to console
        console.warn("[logger] File logging unavailable, using console only:", err.message);
    }
}

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports
});

export default logger;