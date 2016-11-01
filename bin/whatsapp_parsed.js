const Nightmare = require('nightmare');
const realMouse = require('nightmare-real-mouse');
const async = require('async');


const USER_MATOUS = 'Matous Kucera';

class WhatsappHandler {

    nightmare2() {
        const nightmare = initNightmare();

        nightmare
            .goto('https://web.whatsapp.com/')
            .inject('js', '../node_modules/jquery/dist/jquery.min.js')
            .wait('.input-search');

        async.timesSeries(4, (index, next) => {
            nightmare
                .realClick('.input-search');

            this.selectUser(nightmare, USER_MATOUS);
            this.sendMessageText(nightmare, index + ' message')
            // .end()
                .then(function () {
                    console.log('message was sent');
                    next()
                })
                .catch(err => console.log('message sent with error ', error));

            this.webhookMessageReceived(nightmare, USER_MATOUS);
        })
    }

    selectUser(nightmare, name) { // TODO specify the correct name in a better way
        return nightmare
            .insert('input.input-search', name)
            .wait('.chat')
            .realClick('.chat')
            .wait(500);
    }

    sendMessageText(nightmare, message) {
        const selectorSendButton = '#main button.icon-send.send-container';
        return nightmare
            .insert('#main > footer > div.block-compose > div.input-container', message)
            .realClick(selectorSendButton);
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
    return Nightmare({show: true});
}

const whatsappHandler = new WhatsappHandler();
// whatsappHandler.connectMobileWithWeb();
whatsappHandler.nightmare2();

