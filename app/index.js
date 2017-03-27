module.exports = {
    // Utilities
    logger: require('./utils/logger/Logger'),
    scheduler: require('./utils/scheduler/Scheduler'),
    configLoader: require('./utils/config/ConfigLoader'),

    // Bot Version
    version: require('../package').version
};
