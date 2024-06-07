'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('express');
const cors_1 = __importDefault(require('cors'));
const auth_routes_1 = __importDefault(require('../modules/auth/auth.routes'));
const verify_routes_1 = __importDefault(
	require('../modules/verify/verify.routes')
);
const profileCrud_routes_1 = __importDefault(
	require('../modules/profileCrud/profileCrud.routes')
);
const rating_routes_1 = __importDefault(
	require('../modules/rating/rating.routes')
);
const crud_routes_1 = __importDefault(require('../modules/crud/crud.routes'));
const trash_routes_1 = __importDefault(
	require('../modules/trash/trash.routes')
);
const feedback_routes_1 = __importDefault(
	require('../modules/feedback/feedback.routes')
);
const test_routes_1 = __importDefault(require('../modules/test/test.routes'));
const corsConfig = {
	origin: [
		'http://localhost:3000',
		'http://localhost:5173',
		'http://localhost:5000',
		'https://elchocrud.pro'
	],
	credentials: true
};
const router = (0, express_1.Router)();
router.get('/', (0, cors_1.default)(), (req, res) => {
	res.status(200).send({
		status: true
	});
});
router.use('/auth', (0, cors_1.default)(corsConfig), auth_routes_1.default);
router.use('/verify', (0, cors_1.default)(corsConfig), verify_routes_1.default);
router.use(
	'/crud/profile',
	(0, cors_1.default)(corsConfig),
	profileCrud_routes_1.default
);
router.use('/rating', (0, cors_1.default)(corsConfig), rating_routes_1.default);
router.use('/chats', (0, cors_1.default)(corsConfig), trash_routes_1.default);
router.use(
	'/feedback',
	(0, cors_1.default)(corsConfig),
	feedback_routes_1.default
);
router.use('/', (0, cors_1.default)(), crud_routes_1.default);
router.use('/test', (0, cors_1.default)(), test_routes_1.default);
exports.default = router;
