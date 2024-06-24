"use strict";
// export const COOKIE_SETTINGS: Record<string, Record<string, any>> = {
// 	REFRESH_TOKEN:
// 		process.env.NODE_ENV === 'development'
// 			? {
// 					httpOnly: true,
// 					maxAge: 15 * 24 * 3600 * 1000
// 				}
// 			: {
// 					httpOnly: true,
// 					maxAge: 15 * 24 * 3600 * 1000,
// 					secure: true,
// 					sameSite: 'None'
// 				}
// };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESS_TOKEN_EXPIRATION = void 0;
exports.ACCESS_TOKEN_EXPIRATION = 60 * 1000;
