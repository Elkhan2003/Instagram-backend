import { WebSocket } from 'ws';
import crypto from 'crypto';

const generateRandomId = () => {
	const randomBytes = crypto.randomBytes(8);
	return parseInt(randomBytes.toString('hex'), 16).toString();
};

const getUser = async (ws: WebSocket) => {
	const results = generateRandomId();
	ws.send(
		JSON.stringify({
			success: true,
			results
		})
	);
};

export default { getUser };
