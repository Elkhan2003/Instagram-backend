"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../plugins/prisma");
const moment_1 = __importDefault(require("moment/moment"));
const findMaxId = (code) => {
    let maxId = 0;
    code.forEach((item) => {
        if (item._id > maxId) {
            maxId = item._id;
        }
    });
    return maxId;
};
const userRequestCounts = new Map();
const maxRequestsPerSecond = 30;
const userRequestCountsDelete = 1000 * 18;
const getCrudCode = async (req, res) => {
    try {
        const paramsResource = req.params.resource;
        const paramsUrl = req.params.url;
        let setTimeoutId = setTimeout(() => {
            userRequestCounts.delete(paramsUrl);
        }, userRequestCountsDelete);
        if (!userRequestCounts.has(paramsUrl)) {
            userRequestCounts.set(paramsUrl, 1);
        }
        else {
            const count = userRequestCounts.get(paramsUrl) + 1;
            userRequestCounts.set(paramsUrl, count);
            clearTimeout(setTimeoutId);
            if (count > maxRequestsPerSecond) {
                return res.status(429).send({
                    success: false,
                    results: 'Превышен лимит запросов для пользователя'
                });
            }
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                url: paramsUrl,
                resource: paramsResource
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                results: 'Данные не найдены'
            });
        }
        res.status(200).send(findData?.code);
        await userRating('get', paramsUrl, paramsResource);
    }
    catch (error) {
        res.status(500).send({
            success: false,
            results: 'Произошла ошибка при получении данных'
        });
    }
};
const getCrudCodeId = async (req, res) => {
    try {
        const paramsResource = req.params.resource;
        const paramsUrl = req.params.url;
        const paramsId = +req.params._id;
        let setTimeoutId = setTimeout(() => {
            userRequestCounts.delete(paramsUrl);
        }, userRequestCountsDelete);
        if (!userRequestCounts.has(paramsUrl)) {
            userRequestCounts.set(paramsUrl, 1);
        }
        else {
            const count = userRequestCounts.get(paramsUrl) + 1;
            userRequestCounts.set(paramsUrl, count);
            clearTimeout(setTimeoutId);
            if (count > maxRequestsPerSecond) {
                return res.status(429).send({
                    success: false,
                    results: 'Превышен лимит запросов для пользователя'
                });
            }
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                url: paramsUrl,
                resource: paramsResource
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                results: 'Данные не найдены'
            });
        }
        const findCodeId = findData?.code.find((item) => item._id === paramsId);
        res.status(200).send(findCodeId);
        await userRating('get', paramsUrl, paramsResource);
    }
    catch (error) {
        res.status(500).send({
            success: false,
            results: 'Произошла ошибка при получении данных'
        });
    }
};
const postCrudCode = async (req, res) => {
    try {
        const paramsResource = req.params.resource;
        const paramsUrl = req.params.url;
        const reqBody = req.body;
        let setTimeoutId = setTimeout(() => {
            userRequestCounts.delete(paramsUrl);
        }, userRequestCountsDelete);
        if (!userRequestCounts.has(paramsUrl)) {
            userRequestCounts.set(paramsUrl, 1);
        }
        else {
            const count = userRequestCounts.get(paramsUrl) + 1;
            userRequestCounts.set(paramsUrl, count);
            clearTimeout(setTimeoutId);
            if (count > maxRequestsPerSecond) {
                return res.status(429).send({
                    success: false,
                    results: 'Превышен лимит запросов для пользователя'
                });
            }
        }
        if (reqBody._id) {
            return res.status(400).send({
                success: false,
                error: 'Нельзя создавать объекты с ключом _id'
            });
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                url: paramsUrl,
                resource: paramsResource
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const code = findData.code || [];
        const maxId = findMaxId(code);
        const newCodeItem = {
            _id: maxId + 1,
            ...reqBody
        };
        code?.push(newCodeItem);
        res.status(200).send(code);
        const updateData = {
            code: code,
            updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
        };
        await prisma_1.prisma.crud.update({
            where: {
                id: findData?.id
            },
            data: updateData
        });
        await userRating('post', paramsUrl, paramsResource);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Произошла ошибка при создании таблицы',
            message: error
        });
    }
};
const putCrudCode = async (req, res) => {
    try {
        const paramsResource = req.params.resource;
        const paramsUrl = req.params.url;
        const paramsId = +req.params._id;
        const reqBody = req.body;
        let setTimeoutId = setTimeout(() => {
            userRequestCounts.delete(paramsUrl);
        }, userRequestCountsDelete);
        if (!userRequestCounts.has(paramsUrl)) {
            userRequestCounts.set(paramsUrl, 1);
        }
        else {
            const count = userRequestCounts.get(paramsUrl) + 1;
            userRequestCounts.set(paramsUrl, count);
            clearTimeout(setTimeoutId);
            if (count > maxRequestsPerSecond) {
                return res.status(429).send({
                    success: false,
                    results: 'Превышен лимит запросов для пользователя'
                });
            }
        }
        if (reqBody._id) {
            return res.status(400).send({
                success: false,
                error: 'Нельзя обновлять объекты с ключом _id'
            });
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                url: paramsUrl,
                resource: paramsResource
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const code = findData.code || [];
        const filterCodeIndex = code.findIndex((item) => item._id === paramsId);
        if (filterCodeIndex === -1) {
            return res.status(404).send({
                success: false,
                error: 'Элемент с указанным _id не найден'
            });
        }
        const newCodeItem = {
            _id: paramsId,
            ...reqBody
        };
        code.splice(filterCodeIndex, 1, newCodeItem);
        res.status(200).send(code);
        const updateData = {
            code: code,
            updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
        };
        await prisma_1.prisma.crud.update({
            where: {
                id: findData.id
            },
            data: updateData
        });
        await userRating('put', paramsUrl, paramsResource);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error: 'Произошла ошибка при обновлении данных',
            message: error
        });
    }
};
const patchCrudCode = async (req, res) => {
    try {
        const paramsResource = req.params.resource;
        const paramsUrl = req.params.url;
        const paramsId = +req.params._id;
        const reqBody = req.body;
        let setTimeoutId = setTimeout(() => {
            userRequestCounts.delete(paramsUrl);
        }, userRequestCountsDelete);
        if (!userRequestCounts.has(paramsUrl)) {
            userRequestCounts.set(paramsUrl, 1);
        }
        else {
            const count = userRequestCounts.get(paramsUrl) + 1;
            userRequestCounts.set(paramsUrl, count);
            clearTimeout(setTimeoutId);
            if (count > maxRequestsPerSecond) {
                return res.status(429).send({
                    success: false,
                    results: 'Превышен лимит запросов для пользователя'
                });
            }
        }
        if (reqBody._id) {
            return res.status(400).send({
                success: false,
                error: 'Нельзя обновлять объекты с ключом _id'
            });
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                url: paramsUrl,
                resource: paramsResource
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const code = findData.code || [];
        const filterCodeIndex = code.findIndex((item) => item._id === paramsId);
        const filterCodeObjet = code.find((item) => item._id === paramsId);
        if (filterCodeIndex === -1) {
            return res.status(404).send({
                success: false,
                error: 'Элемент с указанным _id не найден'
            });
        }
        const newCodeItem = {
            _id: paramsId,
            ...filterCodeObjet,
            ...reqBody
        };
        code.splice(filterCodeIndex, 1, newCodeItem);
        res.status(200).send(code);
        const updateData = {
            code: code,
            updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
        };
        await prisma_1.prisma.crud.update({
            where: {
                id: findData.id
            },
            data: updateData
        });
        await userRating('patch', paramsUrl, paramsResource);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error: 'Произошла ошибка при обновлении данных',
            message: error
        });
    }
};
const deleteCrudCode = async (req, res) => {
    try {
        const paramsResource = req.params.resource;
        const paramsUrl = req.params.url;
        const paramsId = +req.params._id;
        let setTimeoutId = setTimeout(() => {
            userRequestCounts.delete(paramsUrl);
        }, userRequestCountsDelete);
        if (!userRequestCounts.has(paramsUrl)) {
            userRequestCounts.set(paramsUrl, 1);
        }
        else {
            const count = userRequestCounts.get(paramsUrl) + 1;
            userRequestCounts.set(paramsUrl, count);
            clearTimeout(setTimeoutId);
            if (count > maxRequestsPerSecond) {
                return res.status(429).send({
                    success: false,
                    results: 'Превышен лимит запросов для пользователя'
                });
            }
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                url: paramsUrl,
                resource: paramsResource
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const code = findData.code || [];
        const filterCodeIndex = code.findIndex((item) => item._id === paramsId);
        if (filterCodeIndex === -1) {
            return res.status(404).send({
                success: false,
                error: 'Элемент с указанным _id не найден'
            });
        }
        code.splice(filterCodeIndex, 1);
        res.status(200).send(code);
        const updateData = {
            code: code,
            updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
        };
        await prisma_1.prisma.crud.update({
            where: {
                id: findData.id
            },
            data: updateData
        });
        await userRating('delete', paramsUrl, paramsResource);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error: 'Произошла ошибка при удалении данных',
            message: error
        });
    }
};
const clearCrudCode = async (req, res) => {
    try {
        const paramsResource = req.params.resource;
        const paramsUrl = req.params.url;
        let setTimeoutId = setTimeout(() => {
            userRequestCounts.delete(paramsUrl);
        }, userRequestCountsDelete);
        if (!userRequestCounts.has(paramsUrl)) {
            userRequestCounts.set(paramsUrl, 1);
        }
        else {
            const count = userRequestCounts.get(paramsUrl) + 1;
            userRequestCounts.set(paramsUrl, count);
            clearTimeout(setTimeoutId);
            if (count > maxRequestsPerSecond) {
                return res.status(429).send({
                    success: false,
                    results: 'Превышен лимит запросов для пользователя'
                });
            }
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                url: paramsUrl,
                resource: paramsResource
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const code = [];
        res.status(200).send(code);
        const updateData = {
            code: code,
            updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
        };
        await prisma_1.prisma.crud.update({
            where: {
                id: findData.id
            },
            data: updateData
        });
        await userRating('delete', paramsUrl, paramsResource);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error: 'Произошла ошибка при удалении данных',
            message: error
        });
    }
};
const userRating = async (checkReq, paramsUrl, paramsResource) => {
    try {
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                url: paramsUrl,
                resource: paramsResource
            }
        });
        const userId = findData?.userId;
        const findUser = await prisma_1.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        const ratingData = await prisma_1.prisma.rating.findUnique({
            where: {
                userId: userId
            }
        });
        const baseData = {
            userId: userId,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
            role: findUser?.role,
            photo: findUser?.photo,
            totalReq: ratingData
                ? ratingData.post +
                    ratingData.put +
                    ratingData.patch +
                    ratingData.delete
                : 0,
            //@ts-ignore
            [checkReq]: ratingData ? ratingData[checkReq] + 1 : 1,
            updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
        };
        if (!ratingData) {
            await prisma_1.prisma.rating.create({
                data: {
                    ...baseData,
                    createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
                }
            });
        }
        else {
            await prisma_1.prisma.rating.update({ where: { userId }, data: baseData });
        }
    }
    catch (err) {
        console.log(`${err}`);
    }
};
exports.default = {
    getCrudCode,
    getCrudCodeId,
    postCrudCode,
    putCrudCode,
    patchCrudCode,
    deleteCrudCode,
    clearCrudCode
};
