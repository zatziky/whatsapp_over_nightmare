const async = require('async');
const R = require('ramda');
const debug = require('debug')('wa:message-receiver:users');

class UsersMessageReceiver {

    constructor(nightmare) {
        this.nightmare = nightmare;
        this.usersUnread = [];
    }

    run() {
        debug("Checking for incoming messages every 5 sec.");
        async.forever(
            next => {
                setTimeout(() => {
                    this.detectUnreadUsers((err, usersUnread) => {
                        if(R.equals(this.usersUnread, usersUnread)){
                            return next();
                        }

                        debug('Users waiting for response: ', usersUnread);
                        this.usersUnread = usersUnread;
                        // TODO send users to a webhook
                    });
                }, 5000);
            },
            err => {
                debug(err)
            }
        );
    }

    detectUnreadUsers(cb) {
        return this.nightmare
            .evaluate(() => {
                const selector = '.pane-body.pane-list-body .chat.unread';
                var elmsUserUnread = document.querySelectorAll(selector);
                if (R.isEmpty(elmsUserUnread)) return [];

                return R.map(
                    elmUser => ({
                        user: elmUser.querySelector('.chat-title > span').getAttribute('title'),
                        timestamp: elmUser.querySelector('.chat-time').innerHTML
                    }),
                    elmsUserUnread
                );
            })
            .then(usersUnread => cb(null, usersUnread))
            .catch(cb)
    }

}


function detectUsers() {

}


module.exports = UsersMessageReceiver;