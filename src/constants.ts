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

export const ACCESS_TOKEN_EXPIRATION = 60 * 1000;
