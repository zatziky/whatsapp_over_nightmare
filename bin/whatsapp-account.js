const Nightmare = require('nightmare');
const realMouse = require('nightmare-real-mouse');
const async = require('async');
const debug = require('debug')('wa:account');
const assert = require('assert');
const SelectedUserMessageReceiver = require('./selected-user.message-receiver');
const UsersMessageReceiver = require('./users.message-receiver');
const R = require('ramda');
const fs = require('fs-extra');


class WhatsappAccount {

    constructor(phoneNumber) {
        assert(phoneNumber, '"phoneNumber" must be specified. It\'s value is ' + phoneNumber + '.');
        this.phoneNumber = phoneNumber;

        this.nightmare = initNightmare(phoneNumber);
        this.messageReceiverSelectedUser = new SelectedUserMessageReceiver(this.nightmare);
        this.messageReceiverUsers = new UsersMessageReceiver(this.nightmare);

        this.nightmare
            .goto('https://web.whatsapp.com/')
            .inject('js', 'node_modules/jquery/dist/jquery.min.js')
            .inject('js', 'node_modules/ramda/dist/ramda.min.js')
            .wait('.input-search')
            .then(() => {
                console.log('then() needed to execute queued tasks');
                this.messageReceiverUsers.run()
            })


    }

    takeScreenshot(cb) {
        fs.mkdirsSync(`public/${this.phoneNumber}`)
        this.nightmare
            .screenshot(`public/${this.phoneNumber}/screenshot.png`)
            .then(() => {
                debug(`Screenshot taken to public/${this.phoneNumber}/screenshot.png`);
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
                this.messageReceiverSelectedUser.stop();
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
                this.messageReceiverSelectedUser.run(name);
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

    getUnreadUsers(cb) {
        return this.messageReceiverUsers.detectUnreadUsers(cb);
    }
}

function initNightmare(phoneNumber) {
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
            userData: `C:\\DEV\\whatsapp_over_nightmare\\electron_browser\\${phoneNumber}`
        }
    });
}

module.exports = WhatsappAccount;

