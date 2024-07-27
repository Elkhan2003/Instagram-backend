"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/middleware/validateDto.ts
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const formatValidationErrors = (errors) => {
    return errors.map((error) => Object.values(error.constraints).join(', '));
};
const validateDto = (dtoClass) => {
    return (req, res, next) => {
        const dtoInstance = (0, class_transformer_1.plainToInstance)(dtoClass, req.body);
        (0, class_validator_1.validate)(dtoInstance).then((errors) => {
            if (errors.length > 0) {
                return res.status(400).json({
                    message: formatValidationErrors(errors),
                    error: 'Bad Request',
                    statusCode: 400
                });
            }
            else {
                req.body = dtoInstance;
                next();
            }
        });
    };
};
exports.default = validateDto;
