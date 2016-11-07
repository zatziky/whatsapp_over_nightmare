const Nightmare = require('nightmare');
const realMouse = require('nightmare-real-mouse');
const async = require('async');
const debug = require('debug')('wa:account');
const assert = require('assert');
const MessageReceivedDetector = require('./active-user-received-message.detector');
const R = require('ramda');


const USER_MATOUS = 'Matous Kucera';

class WhatsappAccount {

    constructor(account) {
        assert(account, '"account" must be specified. It\'s value is ' + account + '.');

        this.nightmare = initNightmare(account);
        this.detectorMessageReceived = new MessageReceivedDetector(this.nightmare);

        this.nightmare
            .goto('https://web.whatsapp.com/')
            .inject('js', 'node_modules/jquery/dist/jquery.min.js')
            .inject('js', 'node_modules/ramda/dist/ramda.min.js')
            .wait('.input-search')
            .then(() => {
                console.log('then() needed to execute queued tasks');
            })


    }

    takeScreenshot(cb) {
        this.nightmare
            .screenshot('public/screenshot.png')
            .then(() => {
                debug('Screenshot taken');
                cb()
            })
            .catch(cb)
    }

    selectUser(name, cb) { // TODO specify the correct name in a better way
        console.log('WhatsApp - select user', name);

        this.nightmare
            .evaluate(() => {
                // clear input value
                document.querySelector('.input-search').value = '';
            })
            .then(() => {
                this.detectorMessageReceived.stop();
            })
            .insert('.input-search', name)
            .wait(`.chat-title span[title="${name}"]`)
            .realClick(`.chat-title span[title="${name}"]`)
            .wait(500)
            .evaluate(() => {
                console.log('value', $('.input-search').val());
                return $('.input-search').val()
            })
            .then((input) => {
                cb(null, 'Selected user: ' + input);
                this.detectorMessageReceived.run(name);
            })
            .catch(cb);

    }

    sendMessageText(message, cb) {
        console.log('WhatsApp - sendMessage', message);
        const selectorSendButton = '#main button.icon-send.send-container';
        return this.nightmare
            .insert('div.input-container', message.payload)
            .realClick(selectorSendButton)
            .then(() => cb(null, `Sent Message "${message.payload}"`))
            .catch(cb)
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

function initNightmare(account) {
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
        // show: false,
        paths: {
            userData: `C:\\DEV\\whatsapp_over_nightmare\\electron_browser\\${account}`
        }
    });
}

module.exports = new WhatsappAccount('a');

