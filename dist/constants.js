"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESS_TOKEN_EXPIRATION = exports.COOKIE_SETTINGS = void 0;
exports.COOKIE_SETTINGS = {
    REFRESH_TOKEN: {
        httpOnly: true,
        maxAge: 15 * 24 * 3600 * 1000
    }
};
exports.ACCESS_TOKEN_EXPIRATION = 3600 * 1000;
