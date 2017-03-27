'use strict';
process.title = 'Laravel News';

const _ = require('lodash');
const Discordie = require('discordie');
const directory = require('require-directory');

global.app = require('./app');

app.logger.info(`Bootstraping Laravel news v${app.version}`);

app.logger.info(' - Loading configuration');
app.config = app.configLoader.loadConfiguration('config.json');

app.logger.info(' - Creating bot instance');
global.bot = new Discordie({
    autoReconnect: true
});

const Jobs = directory(module, './app/jobs');
app.logger.info(` - Registering ${Object.keys(Jobs).length - 1} jobs`);
_.each(Jobs, (Job, key) => {
    if (key !== 'Job') {
        app.scheduler.registerJob(new Job);
    }
});

app.logger.info(` - Registering gateway event handlers`);
bot.Dispatcher.on(Discordie.Events.GATEWAY_READY, socket => {
    bot.Users.fetchMembers();
    app.logger.info(
        `Logged in as ${bot.User.username}#${bot.User.discriminator} (ID: ${bot.User.id})` +
        ` and serving ${bot.Users.length} users in ${bot.Guilds.length} servers.`
    );
});

bot.Dispatcher.on(Discordie.Events.DISCONNECTED, socket => {
    app.logger.error('Disonnected from the Discord gateway: ' + socket.error);

    if (socket.autoReconnect) {
        app.logger.error('Attemping to reconnect in ' + Math.ceil(socket.delay) + ' ms');
    }
});

bot.Dispatcher.on(Discordie.Events.GATEWAY_RESUMED, socket => {
    app.logger.info('Discord gateway connection has been resumed!');
});

app.logger.info('Connecting to the Discord network...');
bot.connect({token: app.config.token});
