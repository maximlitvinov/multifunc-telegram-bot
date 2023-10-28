require('dotenv').config();
const menu = require('./menu.json')
const { default: axios } = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN_API;
const bot = new TelegramBot(token, {polling: true});


bot.setMyCommands([
  {command:'/start', description:'Начальное приветствие'},
  {command:'/info', description:'Показать информацию о пользователе'},
  {command:'/weather', description:'Показать прогноз погоды'},
  {command:'/menu', description:'Показать меню магазина'}
])




bot.on('message', async msg => {

    const text = msg.text;
    const name = msg.from.first_name;
    const lastName = msg.from.last_name;
    const userName = msg.from.username;
    const chatId = msg.chat.id;
    const lang = msg.from.language_code;



   async function botStart(){

    async function unkownMessage(messageText){
      const regexpKirilica = /^[?!,.а-яА-ЯёЁ0-9\s]+$/;
      const checkForKirilica = regexpKirilica.test(text);

      if(messageText === '/start'){
        await bot.sendMessage(chatId,`Привет ${name}, Меня зовут бот-Игнатик🐱, я могу показывать тебе погоду напиши "/weather" или выбери её в меню команд!`);
        return bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/22c/b26/22cb267f-a2ab-41e4-8360-fe35ac048c3b/192/8.webp');
       }
     
      if(messageText === '/info'){
        await bot.sendMessage(chatId,'Погоди, собираю информацию о тебе');
        await bot.sendSticker(chatId,'https://cdn.tlgrm.app/stickers/b0d/85f/b0d85fbf-de1b-4aaf-836c-1cddaa16e002/thumb-animated-128.mp4');
        return bot.sendMessage(chatId, `Тебя зовут ${name}, твоя фамилия - ${lastName}, твой никнейм в телеграме - ${userName}, твой язык - ${lang} `)
      }

      if (messageText === '/weather'){
        bot.sendMessage(chatId, 'Пришли мне название города на английском языке');
     }

     if(messageText === '/menu'){
      const buttonOptions = {
        reply_markup: {
          inline_keyboard:[
            [
              {text:'Меню Суши Ким', callback_data:'Меню Суши Ким'}
            ],
            [
              {text:'Меню Кафе Фреш', callback_data:'Меню Кафе Фреш'}
            ]
          ]
    
        }
      }
      bot.sendMessage(chatId,'Вот меню', buttonOptions)
    }
      if (checkForKirilica){
      bot.sendMessage(chatId, `${name}, я тебя не понимаю... `)
      return bot.sendVideo(chatId,'https://media.tenor.com/s5FIe_do3HIAAAAd/%D0%BA%D0%BE%D1%82-%D1%87%D0%B0%D0%B2%D0%BA%D0%B0%D0%B5%D1%82.gif')
    }
    }

    async function getWeather(){
        cityAPI =`http://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=5&appid=${process.env.WEATHER_API}`;

        const responseCity= await axios.get(cityAPI);
        const {lat, lon} = responseCity.data[0];
        

        const nameOfCity = responseCity.data[0].local_names?.ru;
      
        const checkForCity = (city) =>{

          if(city === undefined){
            return responseCity.data[0].name
          }
          else{
            return responseCity.data[0].local_names.ru
          }
        }
        const resultCity = checkForCity(nameOfCity)
        


        const weatherAPI = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API}`;
        const responseWeather = await axios.get(weatherAPI);

        const date = new Date(responseWeather.data.dt * 1000);
        const fullDate = date.toLocaleDateString("en-GB");
        const fullTime = date.toLocaleTimeString("it-IT");
      
      const {temp, feels_like,pressure} = responseWeather.data.main;
      const icon = responseWeather.data.weather[0].icon;
      const weatherIcon = `https://openweathermap.org/img/wn/${icon}@4x.png`
      
      bot.sendMessage(chatId, `Погода в городе ${resultCity}, на ${fullDate}, ${fullTime}, Температура: ${Math.round(temp-273.15)} ºC, Ощущается как: ${Math.round(feels_like-273.15)} ºC, Атмосферное Давление: ${pressure*0.75} мм.рт.ст `)
      bot.sendPhoto(chatId, weatherIcon)  
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


bot.on('callback_query', msg=>{
  const data = msg.data;
  const chatId = msg.message.chat.id;

  bot.sendMessage(chatId,`Ты нажал на ${data}`)
})

botStart()
  
   
})

