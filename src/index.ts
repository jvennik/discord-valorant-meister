import { createConnection } from 'typeorm';
import BotController from './bot/BotController';

// Setup Discord Bot
const bot = new BotController();
bot.connect();

// Setup DB connection
createConnection();
