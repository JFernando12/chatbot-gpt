"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: false,
    },
    number: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    messages: [
        {
            role: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
        },
    ],
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
userSchema.statics.build = (attrs) => {
    return new User(attrs);
};
const User = mongoose_1.default.model('User', userSchema);
exports.User = User;
