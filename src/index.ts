import { Configuration, OpenAIApi } from 'openai';
import { v1 } from './promps';
import { OPENAI_API_KEY } from './config';
import { app } from './app';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const main = async () => {
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: v1,
      },
      {
        role: 'user',
        content: 'mediante la pagina web'
      }
    ],
  });

  console.log(completion.data);
  console.log('message: ', completion.data.choices[0].message);
  console.log('content:', completion.data.choices[0].message?.content);

  // app.listen(3000, () => {
  //   console.log('App listening on port 3000!');
  // });
};

main();
