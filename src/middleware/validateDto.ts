// src/middleware/validateDto.ts
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

const formatValidationErrors = (errors: any[]) => {
	return errors.map((error) => Object.values(error.constraints).join(', '));
};

const validateDto = (dtoClass: any) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const dtoInstance = plainToInstance(dtoClass, req.body);
		validate(dtoInstance).then((errors) => {
			if (errors.length > 0) {
				return res.status(400).json({
					message: formatValidationErrors(errors),
					error: 'Bad Request',
					statusCode: 400
				});
			} else {
				req.body = dtoInstance;
				next();
			}
		});
	};
};
export default validateDto;
