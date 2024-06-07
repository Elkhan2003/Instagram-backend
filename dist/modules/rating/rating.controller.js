"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../plugins/prisma");
const getRating = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        const data = await prisma_1.prisma.rating.findMany();
        const sortedData = data.sort((a, b) => (b.totalReq || 0) - (a.totalReq || 0));
        res.status(200).send({
            success: true,
            results: sortedData
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
            results: 'Произошла ошибка при получении данных'
        });
    }
};
exports.default = {
    getRating
};
