"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESS_TOKEN_EXPIRATION = exports.COOKIE_SETTINGS = void 0;
exports.COOKIE_SETTINGS = {
    REFRESH_TOKEN: process.env.NODE_ENV === 'development'
        ? {
            httpOnly: true,
            maxAge: 15 * 24 * 3600 * 1000
        }
        : {
            httpOnly: true,
            maxAge: 15 * 24 * 3600 * 1000,
            secure: true,
            sameSite: 'None'
        }
};
exports.ACCESS_TOKEN_EXPIRATION = 60 * 1000;
