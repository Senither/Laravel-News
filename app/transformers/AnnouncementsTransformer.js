const Transformer = require('./Transformer');

class AnnouncementsTransformer extends Transformer {
    toEmbeded() {
        return {
            url: this.item.link,
            title: this.item.title,
            description: this.description()
        };
    }
}

module.exports = AnnouncementsTransformer;
