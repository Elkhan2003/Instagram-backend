"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crud_controller_1 = __importDefault(require("./crud.controller"));
const router = (0, express_1.Router)();
router.get('/:url/:resource', crud_controller_1.default.getCrudCode);
router.get('/:url/:resource/:_id', crud_controller_1.default.getCrudCodeId);
router.post('/:url/:resource', crud_controller_1.default.postCrudCode);
router.put('/:url/:resource/:_id', crud_controller_1.default.putCrudCode);
router.patch('/:url/:resource/:_id', crud_controller_1.default.patchCrudCode);
router.delete('/:url/:resource/:_id', crud_controller_1.default.deleteCrudCode);
router.delete('/:url/:resource', crud_controller_1.default.clearCrudCode);
exports.default = router;
