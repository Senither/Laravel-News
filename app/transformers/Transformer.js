const url = require('url');
const md = require('html-md-2');
const striptags = require('striptags');

class Transformer {
    constructor(item) {
        this.item = item;
    }

    description() {
        let description = this.item.description;

        description = striptags(description, ['a', 'p']);
        description = md(description);

        description = description.replace(/\(\[link\]\[0\]\)/g, '');

        const itemUrl = url.parse(this.item.link);

        return description.split('\n')[0] + `\n\n[Read the full article on ${itemUrl.hostname}](${this.item.link})`;
    }

    toEmbeded() {
        throw new Error('#toEmbeded is not implemented');
    }
}

module.exports = Transformer;
