const async = require('async');
const R = require('ramda');
const debug = require('debug')('wa:detector:message-received');

class MessageReceivedDetector {

    constructor(nightmare) {
        this.messagesNew = [];
        this.messageLast = {};
        this.canRun = false;
        this.nightmare = nightmare;

        async.forever(
            next => {
                debug("Checking for incoming messages in 5 sec.");
                setTimeout(() => {
                    if (!this.canRun) {
                        return next();
                    }

                    detectActiveContactReceivedMessage(this.nightmare, this.messageLast, (err, messages) => {
                        if (R.equals(this.messagesNew, messages) || R.isEmpty(messages)) {
                            debug(`No new messages`, messages);
                            return next();
                        }

                        this.messageLast = R.head(messages);
                        this.messagesNew = messages;
                        debug('New messages received', messages);
                        next();
                    });
                }, 5000);
            },
            err => {
                debug(err)
            }
        );
    }

    run(user) {
        this.canRun = true;
        this.messageLast = getLastMessageForUser(user);
        debug('canRun:' + this.canRun, ' with user ' + user);
    }

    stop() {
        this.canRun = false;
        debug('canRun:' + this.canRun);
    }
}

function getLastMessageForUser(user) {
    // TODO get from db
    return {datetime: new Date(1970)}
}

function detectActiveContactReceivedMessage(nightmare, messageLast, cb) {
    nightmare
        .evaluate(getNewMessages, messageLast)
        .then(messagesNew => cb(null, messagesNew))
        .catch(err => console.error("ERROR", err))
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

module.exports = MessageReceivedDetector;