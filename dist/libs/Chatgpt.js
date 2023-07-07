"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGpt = void 0;
const openai_1 = require("openai");
const config_1 = require("../config");
const configuration = new openai_1.Configuration({
    apiKey: config_1.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
class ChatGpt {
    constructor(roleSystem, promp) {
        this.model = 'gpt-3.5-turbo';
        this.temperature = 0;
        this.messages = [];
        this.messages.push({
            role: 'system',
            content: roleSystem,
        });
        if (promp) {
            this.messages.push({
                role: 'user',
                content: promp,
            });
        }
    }
    sendMessage(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            this.messages = this.messages.concat(messages);
            console.log('messageToChatGpt: ', this.messages);
            const completion = yield openai.createChatCompletion({
                model: this.model,
                messages: this.messages,
                temperature: this.temperature,
            });
            return completion.data.choices[0].message;
        });
    }
}
exports.ChatGpt = ChatGpt;
