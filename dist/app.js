"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDocumentation = __importStar(require("./swagger.json"));
const buildServer = () => {
    const server = (0, express_1.default)();
    // swagger
    server.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocumentation));
    // Middleware
    server.use(express_1.default.urlencoded({ extended: true }));
    server.use(express_1.default.json());
    server.use((0, cookie_parser_1.default)());
    server.use((0, express_fingerprint_1.default)({
        // @ts-ignore
        parameters: [express_fingerprint_1.default.useragent, express_fingerprint_1.default.acceptHeaders]
    }));
    server.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*'); // замените "*" на ваш список разрешенных доменов, если необходимо
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });
    server.get('/', (req, res) => {
        res.status(200).send({
            message: 'Hello World!'
        });
    });
    server.use('/api/v1', index_1.default);
    return server;
};
exports.buildServer = buildServer;
