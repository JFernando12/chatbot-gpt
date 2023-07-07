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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Whatsapp_1 = require("./libs/Whatsapp");
const Chat_1 = require("./chat/Chat");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const states_1 = require("./interfaces/states");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(config_1.MONGO_URI);
    yield Whatsapp_1.whatsappClient.start();
    Whatsapp_1.whatsappClient.listen((message) => __awaiter(void 0, void 0, void 0, function* () {
        const number = message.from.slice(3, 13);
        console.log('number', number);
        if (message.from === '5217551163938@c.us') {
            const content = message.body;
            // Create new chat.
            const chat = new Chat_1.Chat(number);
            // Se tendran hasta 2 intentos en caso de fallo.
            let i = 0;
            while (i < 2) {
                try {
                    // Procesar el mensaje;
                    const response = yield chat.messageReceived(content);
                    // Determinar si esta o no hablando con una persona real.
                    if ((response === null || response === void 0 ? void 0 : response.state) !== states_1.UserState.agent && (response === null || response === void 0 ? void 0 : response.messsage)) {
                        yield Whatsapp_1.whatsappClient.sendMessage(number, response.messsage);
                    }
                    else {
                        yield Whatsapp_1.whatsappClient.sendMessage('7551175038', `te estan hablando: ${number}`);
                    }
                    i = 2;
                }
                catch (error) {
                    try {
                        yield Whatsapp_1.whatsappClient.sendMessage('7551175038', `ocurrio fallo: ${number}`);
                    }
                    catch (error) {
                        console.log('Revisar fallo con whatsapp');
                        console.error(error);
                    }
                    i++;
                }
            }
        }
        else {
            console.log('no te conozco');
        }
    }));
});
main();
