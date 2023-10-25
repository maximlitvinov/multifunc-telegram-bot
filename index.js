require('dotenv').config();
const { default: axios } = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN_API;
const bot = new TelegramBot(token, {polling: true});

bot.setMyCommands([
  {command:'/start', description:'Начальное приветствие'},
  {command:'/info', description:'Показать информацию о пользователе'},
  {command:'/weather', description:'Показать прогноз погоды'}
])




bot.on('message', async msg => {
    const text = msg.text;
    const name = msg.from.first_name;
    const lastName = msg.from.last_name;
    const userName = msg.from.username;
    const chatId = msg.chat.id;
    const lang = msg.from.language_code;

    console.log(msg);
   
   async function botStart(){

    function unkownMessage(text){
      if (text === '/weather'){
        bot.sendMessage(chatId, 'Пришли мне название города на английском языке');
     }
      else{
      bot.sendMessage(chatId, `${name}, я тебя не понимаю... `)
      return bot.sendVideo(chatId,'https://media.tenor.com/s5FIe_do3HIAAAAd/%D0%BA%D0%BE%D1%82-%D1%87%D0%B0%D0%B2%D0%BA%D0%B0%D0%B5%D1%82.gif')
    }
    }

    async function getWeather(){
        cityAPI =`http://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=5&appid=${process.env.WEATHER_API}`;

        const responseCity= await axios.get(cityAPI);
        console.log(responseCity.data[0])
        const {lat, lon} = responseCity.data[0];
        const nameOfCity = responseCity.data[0].local_names?.ru;

        const weatherAPI = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API}`;
        const responseWeather = await axios.get(weatherAPI);
      
      const {temp, feels_like,pressure} = responseWeather.data.main;
      

      bot.sendMessage(chatId, `Погода в городе ${nameOfCity}, сейчас температура: ${Math.round(temp-273.15)} ºC, Ощущается как: ${Math.round(feels_like-273.15)} ºC, Атмосферное Давление: ${pressure*0.75} мм.рт.ст`)
        
    }

    if(text === '/start'){
      await bot.sendMessage(chatId,`Привет ${name}, Меня зовут бот-Игнатик🐱, я могу показывать тебе погоду напиши "/weather" или выбери её в меню команд!`);
      return bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/22c/b26/22cb267f-a2ab-41e4-8360-fe35ac048c3b/192/8.webp');
     }
   
    if(text === '/info'){
      await bot.sendMessage(chatId,'Погоди, собираю информацию о тебе');
      await bot.sendSticker(chatId,'https://cdn.tlgrm.app/stickers/b0d/85f/b0d85fbf-de1b-4aaf-836c-1cddaa16e002/thumb-animated-128.mp4');
      return bot.sendMessage(chatId, `Тебя зовут ${name}, твоя фамилия - ${lastName}, твой никнейм в телеграме - ${userName}, твой язык - ${lang} `)
    }


      const regexpForWeather = /^[a-zA-Z]+$/;
       const validMessage = regexpForWeather.test(text);
      

       if (validMessage){
        return getWeather();
       }
      //  else {
      //   return bot.sendMessage(chatId,'Вы ввели город на кирилице, а надо на латинице');
      // }
      
    
    return unkownMessage(text) ;
   }

botStart()
  
   
})

