"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const chats_routes_1 = __importDefault(require("../modules/chats/chats.routes"));
// const corsConfig = {
// 	origin: [
// 		'http://localhost:3000',
// 		'http://localhost:5173',
// 		'http://localhost:5174',
// 		'http://localhost:5175',
// 		'http://localhost:5176',
// 		'http://localhost:5177',
// 		'http://localhost:5178',
// 		'http://localhost:5179',
// 		'http://localhost:5180',
// 		'http://localhost:5000',
// 		'https://elchocrud.pro',
// 		'https://peakspace.elcho.dev'
// 	],
// 	credentials: true,
// 	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] // Добавьте методы сюда
// };
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] // Добавьте методы сюда
};
const router = (0, express_1.Router)();
router.get('/', (0, cors_1.default)(), (req, res) => {
    res.status(200).send({
        status: true
    });
});
router.use('/auth', (0, cors_1.default)(corsConfig), auth_routes_1.default);
router.use('/chats', (0, cors_1.default)(), chats_routes_1.default);
exports.default = router;
