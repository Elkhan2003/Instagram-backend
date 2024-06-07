import { Request, Response } from 'express';
import crypto from 'crypto';

interface CrudType {
	userId: number;
	url: string;
	resource: string;
	code: any[];
}

const getUser = async (req: Request, res: Response) => {
	const generateRandomId = () => {
		const randomBytes = crypto.randomBytes(8);
		const randomId = parseInt(randomBytes.toString('hex'), 16).toString();
		return randomId;
	};

	res.status(200).send({
		success: true,
		results: generateRandomId()
	});
};

const getUserParams = async (
	req: Request<{
		resource: string;
		url: string;
	}>,
	res: Response
) => {
	const generateRandomId = () => {
		const randomBytes = crypto.randomBytes(16);
		const randomId = randomBytes.toString('hex');
		return {
			url: req.params.url || 'unknown',
			resource: req.params.resource || 'unknown',
			randomId
		};
	};

	res.status(200).send({
		success: true,
		results: generateRandomId()
	});
};

const userRequestCounts = new Map<string, number>();
const maxRequestsPerSecond = 5;
const userRequestCountsDelete = 1000 * 3;
const limiterUserRequests = async (
	req: Request<{
		url: string;
	}>,
	res: Response
) => {
	try {
		const paramsUrl = req.params.url;
		let setTimeoutId = setTimeout(() => {
			userRequestCounts.delete(paramsUrl);
		}, userRequestCountsDelete);
		if (!userRequestCounts.has(paramsUrl)) {
			userRequestCounts.set(paramsUrl, 1);
		} else {
			const count = userRequestCounts.get(paramsUrl)! + 1;
			userRequestCounts.set(paramsUrl, count);
			clearTimeout(setTimeoutId);
			if (count > maxRequestsPerSecond) {
				return res.status(429).send({
					success: false,
					results: 'Превышен лимит запросов для пользователя'
				});
			}
		}

		res.status(200).send({
			success: true,
			results: 'Работаю!'
		});
	} catch (error: any) {
		console.error(error);
		res.status(500).send({
			error: 'Произошла ошибка при создании таблицы',
			message: error.message || 'Неопределенная ошибка'
		});
	}
};

export default { getUser, getUserParams, limiterUserRequests };
