"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUpDto = void 0;
const class_validator_1 = require("class-validator");
class SignUpDto {
    email;
    password;
    username;
    photo;
}
exports.SignUpDto = SignUpDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], SignUpDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8)
], SignUpDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], SignUpDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.Matches)(/^https?:\/\/[^\/]+/, {
        message: 'photo must be a URL address'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)()
], SignUpDto.prototype, "photo", void 0);
