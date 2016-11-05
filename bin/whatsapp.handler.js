const Nightmare = require('nightmare');
const realMouse = require('nightmare-real-mouse');
const async = require('async');
const debug = require('debug')('nightmare:actions');
const assert = require('assert');


const USER_MATOUS = 'Matous Kucera';

class WhatsappAccount {

    constructor(account) {
        assert(account, '"account" must be specified. It\'s value is ' + account + '.');

        this.nightmare = initNightmare(account);

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

    selectUser(name, cb) { // TODO specify the correct name in a better way
        console.log('WhatsApp - select user', name);

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
                this.runDetectorActiveUserReceivedMessage(name);
                cb(null, 'Selected user: ' + input);
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

    runDetectorActiveUserReceivedMessage(name) {
        console.log("Checking for incoming messages from user ", name);
        async.forever(
            next => {
                setTimeout(() => {
                    const messageLast = {datetime: new Date(1970)};
                    this.detectActiveContactReceivedMessage(messageLast, next);
                }, 5000);
            },
            err => {
                console.log(err)
            }
        );
    }

    detectActiveContactReceivedMessage(messageLast, cb) {
        this.nightmare
            .evaluate((messageLast) => {
                console.log("MESSAGE LAST", messageLast);
                const messageConverted = {
                    datetime: new Date(messageLast.datetime)
                };

                const messagesReceived = document.querySelectorAll('.message-list > div.msg > div.message-in');
                const messagesNew = [].filter.call(messagesReceived, message => {
                    const getDatetime = text => {
                        const boundLower = text.indexOf('[') + 1;
                        const boundUpper = text.indexOf(']');
                        const datetime = text.substring(boundLower, boundUpper);

                        const hours = datetime.substring(0, datetime.indexOf(':'));
                        const minutes = datetime.substring(datetime.indexOf(':') + 1, datetime.indexOf(','));

                        const date = datetime.slice(datetime.indexOf(', ') + 2);
                        const month = date.substring(0, date.indexOf('/'));
                        const day = date.substring(date.indexOf('/') + 1, date.lastIndexOf('/'));
                        const year = date.substring(date.lastIndexOf('/') + 1);

                        console.log('new Date(year, month, day, hours, minutes)', year, month, day, hours, minutes);

                        return new Date(year, month, day, hours, minutes)
                    };

                    const datetime = getDatetime(message.querySelector('.message-pre-text').innerHTML);
                    console.log(`COMPARING dates ${messageConverted.datetime} < ${datetime} = ${messageConverted.datetime < datetime}`)
                    return messageConverted.datetime < datetime
                });

                return messagesNew.length;

                // What if no contact is selected?
                // messageLast.empty => getLatestMessage
                // messageLast == getLatestMessage => doNothing
                // messageLast < getLatestMessage => fire event
                // messageLast > getLatestMessage => fire ERROR
            }, messageLast)
            .then(result => {
                console.log("XXXXXXX", result);
            })
            .catch(err => console.error("ERROR", err))
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
        paths: {
            userData: `C:\\DEV\\whatsapp_over_nightmare\\electron_browser\\${account}`
        }
    });
}

module.exports = new WhatsappAccount('a');

