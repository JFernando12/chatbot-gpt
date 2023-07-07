"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberValidation = void 0;
const numberValidation = (number) => {
    if (!number) {
        throw new Error('Proporcina numero de whats');
    }
    if (number.length !== 10) {
        throw new Error('Proporciona numero valido');
    }
    return;
};
exports.numberValidation = numberValidation;
