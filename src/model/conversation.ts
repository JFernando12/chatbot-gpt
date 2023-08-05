import mongoose from 'mongoose';
import { ChatCompletionRequestMessage } from 'openai';
import { ConversationState } from '../interfaces/states';
import moment = require('moment-timezone');

moment.tz.setDefault('America/Mexico_City');

interface ConversationAttrs {
  name: string;
  number: string;
  messages: ChatCompletionRequestMessage[];
  state: ConversationState;
  offer?: number;
}

interface ConversationDoc extends mongoose.Document {
  name: string;
  number: string;
  date: Date;
  messages: ChatCompletionRequestMessage[];
  state: ConversationState;
  offer?: number;
  createdAt: Date;
  updatedAt: any;
}

interface ConversationModel extends mongoose.Model<ConversationDoc> {
  build(attrs: ConversationAttrs): ConversationDoc;
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
    offer: {
      type: Number,
      required: false,
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

userSchema.pre<ConversationDoc>('save', function (next) {
  this.updatedAt = moment().toDate();
  next();
});

userSchema.statics.build = (attrs: ConversationAttrs) => {
  return new Conversation(attrs);
};

const Conversation = mongoose.model<ConversationDoc, ConversationModel>(
  'Conversation',
  userSchema
);

export { Conversation };
