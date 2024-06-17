const isProduction = process.env.NODE_ENV !== 'development';

export const COOKIE_SETTINGS: Record<string, Record<string, any>> = {
	REFRESH_TOKEN: {
		httpOnly: true,
		maxAge: 15 * 24 * 3600 * 1000,
		secure: isProduction
	}
};

export const ACCESS_TOKEN_EXPIRATION = 60 * 1000;
