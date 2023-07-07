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
exports.Chat = void 0;
const Chatgpt_1 = require("../libs/Chatgpt");
const user_1 = require("../model/user");
const roles_1 = require("../interfaces/roles");
const templates_1 = require("../interfaces/templates");
const states_1 = require("../interfaces/states");
class Chat {
    constructor(number) {
        this.number = number;
    }
    messageReceived(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = {
                role: 'user',
                content,
            };
            const users = yield user_1.User.find({ number: this.number });
            const user = users[0];
            if (user) {
                const ultimaActualizacion = user.updatedAt;
                // Calcular la diferencia de tiempo entre la última actualización y el momento actual
                const diferenciaTiempo = Date.now() - ultimaActualizacion;
                const diferenciaHoras = Math.floor(diferenciaTiempo / (1000 * 60 * 60));
                const diferenciaSegundos = Math.floor(diferenciaTiempo / 10000);
                console.log('diferenciaHoras: ', diferenciaHoras);
                console.log('diferenciaSegundos: ', diferenciaSegundos);
                if (diferenciaSegundos >= 20) {
                    user.messages = [];
                    user.state = states_1.UserState.new;
                    yield user.save();
                    return { messsage: templates_1.Templates.welcomeMessage, state: user.state };
                }
                if (content.toLocaleLowerCase().includes('agente')) {
                    user.state = states_1.UserState.agent;
                    yield user.save();
                    return { messsage: '', state: user.state };
                }
                if (content.toLocaleLowerCase().includes('lucy')) {
                    user.messages = [];
                    user.state = states_1.UserState.new;
                    yield user.save();
                    return { messsage: templates_1.Templates.welcomeMessage, state: user.state };
                }
                if (user.state === states_1.UserState.new) {
                    if (content.includes('1')) {
                        user.state = states_1.UserState.chatgpt;
                        user.messages.push({
                            role: 'user',
                            content: 'Quiero que enlistes los nombre de los productos y precios e invitame a seleccionar uno para más informacion',
                        });
                        yield user.save();
                        const chatGpt = new Chatgpt_1.ChatGpt(roles_1.RolesSystem.vendedor);
                        const formatedMessages = user.messages.map((message) => ({
                            role: message.role,
                            content: message.content,
                        }));
                        const response = yield chatGpt.sendMessage(formatedMessages);
                        if (response) {
                            user.messages.push(response);
                            yield user.save();
                        }
                        return { messsage: response === null || response === void 0 ? void 0 : response.content, state: user.state };
                    }
                    else if (content.includes('2')) {
                        user.state = states_1.UserState.agent;
                        yield user.save();
                        return { messsage: templates_1.Templates.agentInit, state: user.state };
                    }
                    else if (content.includes('3')) {
                        user.state = states_1.UserState.agent;
                        yield user.save();
                        return { messsage: templates_1.Templates.agentInit, state: user.state };
                    }
                    else {
                        return {
                            messsage: 'Escribe un numero valido: 1, 2, 3',
                            state: user.state,
                        };
                    }
                }
                if (user.state === states_1.UserState.agent) {
                    console.log('Un cliente te necesita');
                    return { messsage: '', state: user.state };
                }
                if (user.state === states_1.UserState.chatgpt) {
                    user.messages.push(newMessage);
                    yield user.save();
                    const chatGpt = new Chatgpt_1.ChatGpt(roles_1.RolesSystem.vendedor);
                    const formatedMessages = user.messages.map((message) => ({
                        role: message.role,
                        content: message.content,
                    }));
                    const response = yield chatGpt.sendMessage(formatedMessages);
                    if (response) {
                        user.messages.push(response);
                        yield user.save();
                    }
                    return {
                        messsage: (response === null || response === void 0 ? void 0 : response.content) +
                            '\n\n_Recuerda que si prefieres realizar tu compra por aquí, escribe "agente" y un miembro de nuestro equipo te atenderá._',
                        state: user.state,
                    };
                }
            }
            else {
                return yield this.newUser();
            }
        });
    }
    newUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = user_1.User.build({
                date: new Date(),
                name: 'pepito',
                number: this.number,
                messages: [],
                state: states_1.UserState.new,
            });
            yield newUser.save();
            return { messsage: templates_1.Templates.welcomeMessage, state: newUser.state };
        });
    }
}
exports.Chat = Chat;
