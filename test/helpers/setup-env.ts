// Ensure valid encryption key before any module loads
import crypto from "crypto";
process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");
process.env.ENCRYPTION_KEY_ID = "v1";
