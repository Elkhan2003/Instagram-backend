import path from 'path';
import fs from 'fs';
import express from 'express';
import { prisma, User as PrismaUser } from '../plugins/prisma';
import session from 'express-session';
import passport from 'passport';
import {
	Strategy as GoogleStrategy,
	Profile as GoogleProfile,
	VerifyCallback
} from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import moment from 'moment';

export const auth = express();

auth.set('trust proxy', 1);
// auth.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

auth.use(
	session({
		secret: fs
			.readFileSync(path.join(__dirname, '/../..', 'secret-key'))
			.toString(),
		resave: false,
		saveUninitialized: false,
		cookie:
			process.env.NODE_ENV === 'development'
				? {
						path: '/'
					}
				: {
						path: '/',
						secure: true,
						maxAge: 1000 * 60 * 60 * 24 * 7,
						sameSite: 'none',
						domain: 'elchocrud.pro'
					},
		store: new PrismaSessionStore(prisma, {
			checkPeriod: 2 * 60 * 1000, //ms
			dbRecordIdIsSessionId: true,
			dbRecordIdFunction: undefined
		})
	})
);

auth.use(passport.initialize());
auth.use(passport.session());

// ! Google
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL:
				process.env.NODE_ENV === 'development'
					? `${process.env.BACKEND_BASE_URL_DEV}/api/v1/auth/callback/google`
					: `${process.env.BACKEND_BASE_URL_PROD}/api/v1/auth/callback/google`
		},
		async function (
			accessToken: string,
			refreshToken: string,
			profile: GoogleProfile,
			done: VerifyCallback
		) {
			try {
				const profileData = await prisma.user.findUnique({
					where: { login: profile._json.email }
				});
				if (!profileData) {
					const createdUser = await prisma.user.create({
						data: {
							auth: 'Google',
							firstName: profile._json.given_name || '',
							lastName: profile._json.family_name || '',
							login: profile._json.email || '',
							password: '',
							photo: profile._json.picture || '',
							createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
							updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
						}
					});
					return done(undefined, createdUser);
				} else {
					return done(undefined, profileData);
				}
			} catch (err) {
				console.log(`${err}`);
			}
		}
	)
);

// ! GitHub
passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			callbackURL:
				process.env.NODE_ENV === 'development'
					? `${process.env.BACKEND_BASE_URL_DEV}/api/v1/auth/callback/github`
					: `${process.env.BACKEND_BASE_URL_PROD}/api/v1/auth/callback/github`
		},
		async function (
			accessToken: string,
			refreshToken: string,
			profile: any,
			done: any
		) {
			try {
				const profileData = await prisma.user.findFirst({
					where: { login: profile._json.email || profile._json.login }
				});
				const userNameSplit = profile._json.name.split(' ');
				const firstName = userNameSplit[0];
				const lastName = userNameSplit[1];
				if (!profileData) {
					const createdUser = await prisma.user.create({
						data: {
							auth: 'GitHub',
							firstName: firstName || '',
							lastName: lastName || '',
							login: profile._json.email || profile._json.login,
							password: '',
							photo: profile._json.avatar_url || '',
							createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
							updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
						}
					});
					return done(undefined, createdUser);
				} else {
					return done(undefined, profileData);
				}
			} catch (err) {
				console.log(`${err}`);
			}
		}
	)
);

passport.serializeUser(async (user: PrismaUser, done: Function) => {
	return done(null, user);
});

passport.deserializeUser(async (payload: PrismaUser, done: Function) => {
	const user = await prisma.user.findUnique({
		where: { id: payload.id }
	});
	return user ? done(null, user) : done(null, null);
});

auth.get(
	'/api/v1/auth/callback/google',
	passport.authenticate('google', {
		successRedirect:
			process.env.NODE_ENV === 'development'
				? `${process.env.FRONTEND_BASE_URL_DEV}/dashboard`
				: `${process.env.FRONTEND_BASE_URL_PROD}/dashboard`,
		failureRedirect:
			process.env.NODE_ENV === 'development'
				? `${process.env.FRONTEND_BASE_URL_DEV}/login`
				: `${process.env.FRONTEND_BASE_URL_PROD}/login`
	})
);

auth.get(
	'/api/v1/auth/callback/github',
	passport.authenticate('github', {
		successRedirect:
			process.env.NODE_ENV === 'development'
				? `${process.env.FRONTEND_BASE_URL_DEV}/dashboard`
				: `${process.env.FRONTEND_BASE_URL_PROD}/dashboard`,
		failureRedirect:
			process.env.NODE_ENV === 'development'
				? `${process.env.FRONTEND_BASE_URL_DEV}/login`
				: `${process.env.FRONTEND_BASE_URL_PROD}/login`
	})
);
