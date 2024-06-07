"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../plugins/prisma");
const moment_1 = __importDefault(require("moment/moment"));
const findUserCrud = async (req, res) => {
    const user = req.user;
    const data = await prisma_1.prisma.crud.findMany({
        where: {
            userId: user?.id
        }
    });
    return data;
};
const generateRandomToken = () => {
    const randomBytes = crypto_1.default.randomBytes(16);
    const randomId = randomBytes.toString('hex');
    return randomId;
};
const getAllCrud = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const data = await prisma_1.prisma.crud.findMany({
            where: {
                userId: user?.id
            }
        });
        data.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
        });
        res.status(200).send({
            success: true,
            results: data
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
            results: 'Произошла ошибка при полуении данных'
        });
    }
};
const getAllDashboardCrud = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const data = await prisma_1.prisma.crud.findMany({
            where: {
                userId: user?.id,
                isTrash: false
            }
        });
        data.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
        });
        res.status(200).send({
            success: true,
            results: data
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
            results: 'Произошла ошибка при полуении данных из Dashboard'
        });
    }
};
const getAllTrashCrud = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const data = await prisma_1.prisma.crud.findMany({
            where: {
                userId: user?.id,
                isTrash: true
            }
        });
        data.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
        });
        res.status(200).send({
            success: true,
            results: data
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
            results: 'Произошла ошибка при полуении данных из корзины'
        });
    }
};
const createCrudTable = async (req, res) => {
    try {
        const user = req.user;
        const crud = req.body;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const existingUserCruds = await findUserCrud(req, res);
        const isDuplicate = existingUserCruds.some((item) => item.resource === crud.resource);
        if (isDuplicate) {
            return res.status(422).send({
                success: false,
                results: 'Поймал дубль!'
            });
        }
        const lastCrud = await prisma_1.prisma.crud.findFirst({
            orderBy: {
                id: 'desc'
            }
        });
        let lastId = 0;
        if (lastCrud) {
            lastId = lastCrud.id;
        }
        const data = await prisma_1.prisma.crud.create({
            data: {
                userId: user.id,
                url: generateRandomToken(),
                resource: crud.resource,
                code: [],
                id: lastId + 1,
                createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
                updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
            }
        });
        res.status(200).send({
            success: true,
            results: data
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Произошла ошибка при создании таблицы',
            message: error
        });
    }
};
const trashCrudTable = async (req, res) => {
    try {
        const user = req.user;
        const paramsId = +req.params.id;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                id: paramsId
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const data = await prisma_1.prisma.crud.update({
            where: {
                id: paramsId
            },
            data: {
                isTrash: true
            }
        });
        res.status(200).send({
            success: true,
            results: data
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Произошла ошибка при перемещении таблицы в корзину',
            message: error
        });
    }
};
const trashAllCrudTable = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const findData = await prisma_1.prisma.crud.findMany({
            where: {
                userId: user?.id,
                isTrash: false
            }
        });
        if (!findData || findData.length === 0) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const updatedData = await prisma_1.prisma.crud.updateMany({
            where: {
                userId: user.id
            },
            data: {
                isTrash: true
            }
        });
        res.status(200).send({
            success: true,
            results: updatedData
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Произошла ошибка при перемещении таблиц в корзину',
            message: error
        });
    }
};
const recoveryCrudTable = async (req, res) => {
    try {
        const user = req.user;
        const paramsId = +req.params.id;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                id: paramsId
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const data = await prisma_1.prisma.crud.update({
            where: {
                id: paramsId
            },
            data: {
                isTrash: false
            }
        });
        res.status(200).send({
            success: true,
            results: data
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Произошла ошибка при восстановлении таблицы из корзины',
            message: error
        });
    }
};
const recoveryAllCrudTable = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const findData = await prisma_1.prisma.crud.findMany({
            where: {
                userId: user?.id,
                isTrash: true
            }
        });
        if (!findData || findData.length === 0) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const updatedData = await prisma_1.prisma.crud.updateMany({
            where: {
                userId: user.id
            },
            data: {
                isTrash: false
            }
        });
        res.status(200).send({
            success: true,
            results: updatedData
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Произошла ошибка при восстановлении таблиц из корзины',
            message: error
        });
    }
};
const deleteCrudTable = async (req, res) => {
    try {
        const user = req.user;
        const paramsId = +req.params.id;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const findData = await prisma_1.prisma.crud.findFirst({
            where: {
                id: paramsId
            }
        });
        if (!findData) {
            return res.status(404).send({
                success: false,
                error: 'Данные не найдены'
            });
        }
        const data = await prisma_1.prisma.crud.delete({
            where: {
                id: paramsId
            }
        });
        res.status(200).send({
            success: true,
            results: data
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Произошла ошибка при удалении таблицы',
            message: error
        });
    }
};
const deleteAllCrudTable = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const dataToDelete = await prisma_1.prisma.crud.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true
            }
        });
        const idsToDelete = dataToDelete.map((entry) => entry.id);
        if (idsToDelete.length === 0) {
            return res.status(200).send({
                success: true,
                results: 'Записей для удаления не найдено'
            });
        }
        const deletedData = await prisma_1.prisma.crud.deleteMany({
            where: {
                id: {
                    in: idsToDelete
                }
            }
        });
        res.status(200).send({
            success: true,
            results: deletedData
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Произошла ошибка при удалении таблиц',
            message: error
        });
    }
};
exports.default = {
    getAllCrud,
    getAllDashboardCrud,
    getAllTrashCrud,
    createCrudTable,
    trashCrudTable,
    trashAllCrudTable,
    recoveryCrudTable,
    recoveryAllCrudTable,
    deleteCrudTable,
    deleteAllCrudTable
};
