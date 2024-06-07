"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../plugins/prisma");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const prisma_session_store_1 = require("@quixo3/prisma-session-store");
const moment_1 = __importDefault(require("moment"));
exports.auth = (0, express_1.default)();
exports.auth.set('trust proxy', 1);
// auth.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
exports.auth.use((0, express_session_1.default)({
    secret: fs_1.default
        .readFileSync(path_1.default.join(__dirname, '/../..', 'secret-key'))
        .toString(),
    resave: false,
    saveUninitialized: false,
    cookie: process.env.NODE_ENV === 'development'
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
    store: new prisma_session_store_1.PrismaSessionStore(prisma_1.prisma, {
        checkPeriod: 2 * 60 * 1000, //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
    })
}));
exports.auth.use(passport_1.default.initialize());
exports.auth.use(passport_1.default.session());
// ! Google
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'development'
        ? `${process.env.BACKEND_BASE_URL_DEV}/api/v1/auth/callback/google`
        : `${process.env.BACKEND_BASE_URL_PROD}/api/v1/auth/callback/google`
}, async function (accessToken, refreshToken, profile, done) {
    try {
        const profileData = await prisma_1.prisma.user.findUnique({
            where: { login: profile._json.email }
        });
        if (!profileData) {
            const createdUser = await prisma_1.prisma.user.create({
                data: {
                    auth: 'Google',
                    firstName: profile._json.given_name || '',
                    lastName: profile._json.family_name || '',
                    login: profile._json.email || '',
                    password: '',
                    photo: profile._json.picture || '',
                    createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
                    updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
                }
            });
            return done(undefined, createdUser);
        }
        else {
            return done(undefined, profileData);
        }
    }
    catch (err) {
        console.log(`${err}`);
    }
}));
// ! GitHub
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'development'
        ? `${process.env.BACKEND_BASE_URL_DEV}/api/v1/auth/callback/github`
        : `${process.env.BACKEND_BASE_URL_PROD}/api/v1/auth/callback/github`
}, async function (accessToken, refreshToken, profile, done) {
    try {
        const profileData = await prisma_1.prisma.user.findFirst({
            where: { login: profile._json.email || profile._json.login }
        });
        const userNameSplit = profile._json.name.split(' ');
        const firstName = userNameSplit[0];
        const lastName = userNameSplit[1];
        if (!profileData) {
            const createdUser = await prisma_1.prisma.user.create({
                data: {
                    auth: 'GitHub',
                    firstName: firstName || '',
                    lastName: lastName || '',
                    login: profile._json.email || profile._json.login,
                    password: '',
                    photo: profile._json.avatar_url || '',
                    createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
                    updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
                }
            });
            return done(undefined, createdUser);
        }
        else {
            return done(undefined, profileData);
        }
    }
    catch (err) {
        console.log(`${err}`);
    }
}));
passport_1.default.serializeUser(async (user, done) => {
    return done(null, user);
});
passport_1.default.deserializeUser(async (payload, done) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: payload.id }
    });
    return user ? done(null, user) : done(null, null);
});
exports.auth.get('/api/v1/auth/callback/google', passport_1.default.authenticate('google', {
    successRedirect: process.env.NODE_ENV === 'development'
        ? `${process.env.FRONTEND_BASE_URL_DEV}/dashboard`
        : `${process.env.FRONTEND_BASE_URL_PROD}/dashboard`,
    failureRedirect: process.env.NODE_ENV === 'development'
        ? `${process.env.FRONTEND_BASE_URL_DEV}/login`
        : `${process.env.FRONTEND_BASE_URL_PROD}/login`
}));
exports.auth.get('/api/v1/auth/callback/github', passport_1.default.authenticate('github', {
    successRedirect: process.env.NODE_ENV === 'development'
        ? `${process.env.FRONTEND_BASE_URL_DEV}/dashboard`
        : `${process.env.FRONTEND_BASE_URL_PROD}/dashboard`,
    failureRedirect: process.env.NODE_ENV === 'development'
        ? `${process.env.FRONTEND_BASE_URL_DEV}/login`
        : `${process.env.FRONTEND_BASE_URL_PROD}/login`
}));
