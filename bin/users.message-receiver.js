const async = require('async');
const R = require('ramda');
const debug = require('debug')('wa:message-receiver:users');

class UsersMessageReceiver {

    constructor(nightmare) {
        this.nightmare = nightmare;
        this.usersReplied = [];
    }

    run() {
        async.forever(
            next => {
                debug("Checking for incoming messages in 5 sec.");
                setTimeout(() => {
                    detectUsersThatReplied(this.nightmare, this.messageLast, (err, usersReplied) => {
                        this.usersReplied = usersReplied;
                        next();
                    });
                }, 5000);
            },
            err => {
                debug(err)
            }
        );
    }

}

function detectUsersThatReplied(nightmare, messageLast, cb) {
    nightmare
        .evaluate(detectUsers)
        .then(messagesNew => cb(null, messagesNew))
        .catch(err => console.error("ERROR", err))
}

function detectUsers() {

}


module.exports = UsersMessageReceiver;