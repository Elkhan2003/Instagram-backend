"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESS_TOKEN_EXPIRATION = exports.COOKIE_SETTINGS = void 0;
const isProduction = process.env.NODE_ENV !== 'development';
exports.COOKIE_SETTINGS = {
    REFRESH_TOKEN: {
        httpOnly: true,
        maxAge: 15 * 24 * 3600 * 1000,
        secure: isProduction
    }
};
exports.ACCESS_TOKEN_EXPIRATION = 60 * 1000;
