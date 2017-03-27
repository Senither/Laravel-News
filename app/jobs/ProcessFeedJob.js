const _ = require('lodash');
const moment = require('moment');
const request = require('request');
const FeedParser = require('feedparser');
const Job = require('./Job');

const NewsFeedTransformer = require('./../transformers/NewsFeedTransformer');
const AnnouncementsTransformer = require('./../transformers/AnnouncementsTransformer');

class ProcessFeedJob extends Job {

    /**
     * This method determines when the job should be execcuted.
     *
     * @param  {RecurrenceRule} rule  A node-schedule CRON recurrence rule instance
     * @return {mixed}
     */
    runCondition(rule) {
        return '*/5 * * * *';
    }

    /**
     * The jobs main logic method, this method is executed
     * whenever the {@link Job#runCondition} method returns true.
     *
     * @override
     */
    run() {
        this.requestFeed('https://medium.com/feed/laravel-announcements').then(response => {
            this.sendNewsToGuild(
                this.prepareLatest(response, 5, AnnouncementsTransformer), 'Laravel Announcements'
            );
        }).catch(err => app.logger.error(err));

        this.requestFeed('https://feed.laravel-news.com/').then(response => {
            this.sendNewsToGuild(
                this.prepareLatest(response, 5, NewsFeedTransformer), 'Laravel news Feed'
            );
        }).catch(err => app.logger.error(err));
    }

    requestFeed(url) {
        return new Promise((resolve, reject) => {
            const items = [];

            const req = request(url);
            const feedParser = new FeedParser;

            req.on('error', err => reject(err));
            req.on('response', function (res) {
                if (res.statusCode !== 200) {
                    return this.emit('error', new Error('Bad status code, ' + res.status));
                }
                this.pipe(feedParser);
            });

            feedParser.on('error', err => reject(err));
            feedParser.on('readable', function () {
                const stream = this;
                const meta = this.meta;
                let item;

                while ((item = stream.read()) !== null) {
                    items.push(item);
                }

                return resolve(items);
            });
        });
    }

    sendNewsToGuild(transformers, footnote) {
        bot.Guilds.forEach(guild => {
            guild.textChannels.forEach(channel => {
                if (channel.name !== null && (channel.name === 'laravel_news' || channel.name === 'news')) {
                    _.each(transformers, transformer => {
                        const embeded = transformer.toEmbeded();

                        if (!embeded.hasOwnProperty('color')) {
                            embeded.color = 0xEF4E42;
                        }

                        embeded.footer = {
                            text: footnote
                        };

                        channel.sendMessage('', false, embeded);
                    });
                }
            });
        });
    }

    prepareLatest(items, minutes, Transformer) {
        return items.filter(item => {
            const date = moment(item.pubDate, 'YYYY-MM-DDTHH:mm:ss');

            return Math.floor(moment(new Date).diff(date) / 1000 / 60) <= minutes;
        }).map(item => new Transformer(item));
    }
}

module.exports = ProcessFeedJob;
