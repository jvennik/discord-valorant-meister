import { Message, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import config from '../config';
import logger from '../logger';
import { Commands } from './commands';
import { periodicMessage } from '../actions/periodicMessage';

export class BotController {
  public client = new CommandoClient({
    commandPrefix: config.general.commandPrefix,
    owner: config.general.ownerId,
  });

  public connect = (): void => {
    this.client.registry
      .registerDefaultTypes()
      .registerGroups([['general', 'General Commands']])
      .registerDefaultGroups()
      .registerDefaultCommands()
      .registerCommands(Commands);

    this.client.login(config.general.botToken);

    this.client.on('ready', () => {
      logger.info('Welcome to Valorant Meister');
      logger.info('Connected to Discord');

      if (this.client.user) {
        this.client.user.setUsername(config.general.botUsername);
        this.client.user.setPresence({
          activity: { name: 'ABENO' },
        });
      }
    });

    this.client.on('message', (msg: Message) => {
      const channel = msg.channel as TextChannel;
      const guild = msg.guild;
      if (channel && guild) {
        periodicMessage({ guildId: guild.id, channel: channel });
      }
    });

    this.client.on('error', (error) => {
      logger.error(`Something went wrong. Reason: ${error.message}`);
    });
  };
}

export default BotController;
