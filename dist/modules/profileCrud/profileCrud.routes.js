"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileCrud_controller_1 = __importDefault(require("./profileCrud.controller"));
const router = (0, express_1.Router)();
router.get('/getAll', profileCrud_controller_1.default.getAllCrud);
router.get('/getAllDashboard', profileCrud_controller_1.default.getAllDashboardCrud);
router.get('/getAllTrash', profileCrud_controller_1.default.getAllTrashCrud);
router.post('/create', profileCrud_controller_1.default.createCrudTable);
router.patch('/trash/:id', profileCrud_controller_1.default.trashCrudTable);
router.patch('/trashAll', profileCrud_controller_1.default.trashAllCrudTable);
router.patch('/recovery/:id', profileCrud_controller_1.default.recoveryCrudTable);
router.patch('/recoveryAll', profileCrud_controller_1.default.recoveryAllCrudTable);
router.delete('/delete/:id', profileCrud_controller_1.default.deleteCrudTable);
router.delete('/deleteAll', profileCrud_controller_1.default.deleteAllCrudTable);
exports.default = router;
