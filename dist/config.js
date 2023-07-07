"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGO_URI = exports.OPENAI_API_KEY = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
exports.MONGO_URI = process.env.MONGO_URI;
