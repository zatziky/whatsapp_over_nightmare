const Nightmare = require('nightmare');
const realMouse = require('nightmare-real-mouse');
const async = require('async');
const debug = require('debug')('nightmare:actions');


const USER_MATOUS = 'Matous Kucera';

class WhatsappHandler {

    constructor() {
        this.nightmare = initNightmare();

        this.nightmare
            .goto('https://web.whatsapp.com/')
            .inject('js', 'node_modules/jquery/dist/jquery.min.js')
            .wait('.input-search')
            .then(() => {
                console.log('then() needed to execute queued tasks');

            })
    }

    nightmare2() {
        const nightmare = this.nightmare;

        this.selectUser(nightmare, USER_MATOUS);
        this.sendMessageText(nightmare, 1 + ' message')
        // .end()
            .then(function () {
                console.log('message was sent');
                next()
            })
            .catch(err => console.log('message sent with error ', error));

        // async.timesSeries(1, (index, next) => {
        //     nightmare
        //         .wait('.input-search')
        //
        //     this.selectUser(nightmare, USER_MATOUS);
        //     this.sendMessageText(nightmare, index + ' message')
        //     // .end()
        //         .then(function () {
        //             console.log('message was sent');
        //             next()
        //         })
        //         .catch(err => console.log('message sent with error ', error));
        //
        //     // this.webhookMessageReceived(nightmare, USER_MATOUS);
        // })
    }

    selectUser(name) { // TODO specify the correct name in a better way
        this.nightmare
            .insert('.input-search', name)
            .wait(`.chat-title span[title="${name}"]`)
            .realClick(`.chat-title span[title="${name}"]`)
            .wait(500)
            .evaluate(() => {
                console.log('value', $('.input-search').val());
                return $('.input-search').val()
            })
            .then((input) => {
                console.log('Selected user', input)
            });

    }

    sendMessageText(nightmare, message) {
        const selectorSendButton = '#main button.icon-send.send-container';
        return nightmare
            .insert('#main > footer > div.block-compose > div.input-container', message)
            .realClick(selectorSendButton)
    }

    webhookMessageReceived(nightmare, name) {
        console.log("WEBHOOK", name);
        return nightmare
            .evaluate(() => true)
            .then(value => {
                console.log(document);
                const length = document.querySelector('#main > div.pane-body.pane-chat-tile-container > div > div > div.message-list');
                console.log('message length2: ', length);
            })
            .catch(err => console.log('Webhook error:', err));
    }


}

function initNightmare() {
    realMouse(Nightmare);

    Nightmare.action('evaluateSpa', function (selector, done) {
        debug('evaluateSpa on ' + selector);
        this.evaluate_now(function (selector) {
            console.log('for selector', selector)
            var element = document.querySelector(selector);
            if (!element) {
                throw new Error('Unable to find element by selector: ' + selector);
            }
            console.log('found ', element.value);
        }, done, selector);
    });

    return Nightmare({
        show: true,
    });
}

module.exports = new WhatsappHandler();
