const async = require('async');
const R = require('ramda');
const debug = require('debug')('wa:detector:message-received');

class MessageReceivedDetector {

    constructor(){
        this.messagesNew = [];
        this.messageLast = {datetime: new Date(1970)};
    }

    run(callback){
        async.forever(
            next => {
                debug("Checking for incoming messages in 5 sec.");
                setTimeout(() => {
                    callback(this.messageLast, (err, messages) => {
                        if(R.equals(this.messagesNew, messages) || R.isEmpty(messages)) {
                            debug(`No new messages`, messages);
                            debug(`this.messagesNew`, this.messagesNew);
                            return next();
                        }

                        this.messageLast = R.last(messages);
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
}



module.exports = MessageReceivedDetector;