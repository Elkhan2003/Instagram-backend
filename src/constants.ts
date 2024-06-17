export const COOKIE_SETTINGS = {
	REFRESH_TOKEN: {
		httpOnly: true,
		maxAge: 15 * 24 * 3600 * 1000
	}
};
export const ACCESS_TOKEN_EXPIRATION: number = 3600 * 1000;
