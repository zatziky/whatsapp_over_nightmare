const Nightmare = require('nightmare');
const realMouse = require('nightmare-real-mouse');
const async = require('async');
const debug = require('debug')('nightmare:actions');
const assert = require('assert');
const MessageReceivedDetector = require('./active-user-received-message.detector');
const R = require('ramda');


const USER_MATOUS = 'Matous Kucera';

class WhatsappAccount {

    constructor(account) {
        assert(account, '"account" must be specified. It\'s value is ' + account + '.');

        this.nightmare = initNightmare(account);
        this.detectorMessageReceived = new MessageReceivedDetector();

        this.nightmare
            .goto('https://web.whatsapp.com/')
            .inject('js', 'node_modules/jquery/dist/jquery.min.js')
            .inject('js', 'node_modules/ramda/dist/ramda.min.js')
            .wait('.input-search')
            .then(() => {
                console.log('then() needed to execute queued tasks');
                this.detectorMessageReceived.run(this.detectActiveContactReceivedMessage.bind(this));
            })


    }

    selectUser(name, cb) { // TODO specify the correct name in a better way
        console.log('WhatsApp - select user', name);

        this.nightmare
            .evaluate(() => {
                document.querySelector('.input-search').value = '';
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

    detectActiveContactReceivedMessage(messageLast, cb) {
        this.nightmare
            .evaluate(getNewMessages, messageLast)
            .then(messagesNew => cb(null, messagesNew))
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
        // show: false,
        paths: {
            userData: `C:\\DEV\\whatsapp_over_nightmare\\electron_browser\\${account}`
        }
    });
}

function getNewMessages(messageArg) {
    console.log("MESSAGE LAST", messageArg);
    const messageLast = R.assoc('datetime', new Date(messageArg.datetime), messageArg);
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

        return new Date(year, month, day, hours, minutes)
    };
    const getPayload = text => {
        const boundLower = text.indexOf('-->') + 3;
        const boundUpper = text.lastIndexOf('<!--');
        return text.substring(boundLower, boundUpper);
    };

    const messagesReceived = R.reverse(document.querySelectorAll('.message-list > div.msg > div.message-in'));
    if (R.isEmpty(messagesReceived)) {
        console.log('getNewMessages() - No messages received.');
        return [];
    }

    return R.pipe(
        R.findIndex(message => {
            const datetime = getDatetime(message.querySelector('.message-pre-text').innerHTML);
            const payload = getPayload(message.querySelector('.emojitext.selectable-text').innerHTML)
            return R.and(
                R.propEq('datetime', datetime, messageLast),
                R.propEq('payload', payload, messageLast)
            );
        }),
        index => {
            console.log(index);
            console.log('getNewMessages() - index of last message received: ', index < 0 ? 0 : index + 1);
            return index < 0 ? messagesReceived.length : index + 1
        },
        R.take(R.__, messagesReceived),
        R.map(message => {
            const datetime = getDatetime(message.querySelector('.message-pre-text').innerHTML);
            const payload = getPayload(message.querySelector('.emojitext.selectable-text').innerHTML);
            return {datetime, payload}
        })
    )
    (messagesReceived);

    // What if no contact is selected?
    // message.empty => getLatestMessage
    // message == getLatestMessage => doNothing
    // message < getLatestMessage => fire event
    // message > getLatestMessage => fire ERROR
}

module.exports = new WhatsappAccount('a');

