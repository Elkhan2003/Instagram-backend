"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const express_fingerprint_1 = __importDefault(require("express-fingerprint"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const buildServer = () => {
    const server = (0, express_1.default)();
    // Middleware
    server.use(express_1.default.urlencoded({ extended: true }));
    server.use(express_1.default.json());
    server.use((0, cookie_parser_1.default)());
    server.use((0, express_fingerprint_1.default)({
        // @ts-ignore
        parameters: [express_fingerprint_1.default.useragent, express_fingerprint_1.default.acceptHeaders]
    }));
    server.get('/', (req, res) => {
        res.status(200).send({
            message: 'Hello World!'
        });
    });
    server.use('/api/v1', index_1.default);
    return server;
};
exports.buildServer = buildServer;
