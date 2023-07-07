import mongoose from 'mongoose';
import { ChatCompletionRequestMessage } from 'openai';
import { UserState } from '../interfaces/states';
import moment = require('moment-timezone');

moment.tz.setDefault('America/Mexico_City');

interface UserAttrs {
  name: string;
  number: string;
  messages: ChatCompletionRequestMessage[];
  state: UserState;
}

interface UserDoc extends mongoose.Document {
  name: string;
  number: string;
  date: Date;
  messages: ChatCompletionRequestMessage[];
  state: UserState;
  createdAt: Date;
  updatedAt: any;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    number: {
      type: String,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

userSchema.pre<UserDoc>('save', function (next) {
  this.updatedAt = moment().toDate();
  next();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
