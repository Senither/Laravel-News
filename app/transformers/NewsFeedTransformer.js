const Transformer = require('./Transformer');

class AnnouncementsTransformer extends Transformer {
    toEmbeded() {
        return {
            color: 0x3498DB,
            url: this.item.link,
            title: this.item.title,
            description: this.description()
        };
    }
}

module.exports = AnnouncementsTransformer;
