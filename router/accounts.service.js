const R = require('ramda');
const debug = require('debug')('wa:AccountsService');
const WhatsappAccount = require('../bin/whatsapp-account.js');

class AccountsService {

    constructor(){
        this.accounts = [];
    }

    addAccount(phoneNumber, cb){
        if(R.any(R.propEq('phoneNumber', phoneNumber), this.accounts)){
            debug(`Account ${phoneNumber} is already running`);
            return cb(`Account ${phoneNumber} is already running`);
        }

        this.accounts = R.append(new WhatsappAccount(phoneNumber), this.accounts);
        cb(`Started WhatsApp account for phone number ${phoneNumber}`);
    }

    getAccount(phoneNumber, cb){
        const account = R.find(R.propEq('phoneNumber', phoneNumber), this.accounts);
        if(R.isNil(account)){
            debug(`Account ${phoneNumber} is not running!`);
            return cb(`Account ${phoneNumber} is not running!`)
        }

        cb(null, account);
    }
}

module.exports = new AccountsService();