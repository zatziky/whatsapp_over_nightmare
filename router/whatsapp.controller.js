const express = require('express');
const serviceAccounts = require('./accounts.service');
const async = require('async');
const debug = require('debug')('wa:controller');
const error = require('debug')('wa:controller:error');



class WhatsappController{

    runAccount(req, res, next){
        const phoneNumber = req.params.phoneNumber;
        debug(`runAccount() - phoneNumber: ${phoneNumber}`);
        serviceAccounts.addAccount(phoneNumber, respond.bind(null, res, next));
    }

    selectUser(req, res, next){
        const name = req.params.name;

        WhatsappAccount.selectUser(name, respond.bind(null, res, next));
    }

    sendMessage(req, res, next){
        const name = req.params.name;
        const message = req.body;
        console.log(`Controller WhatsApp - sendMessage, user: ${name}, message: ${message}`);

        // TODO
        // 1. check correct user selected
        // 2. send message

        async.series([
            cb => WhatsappAccount.selectUser(name, cb),
            cb => WhatsappAccount.sendMessageText(message, cb)
        ], respond.bind(null, res, next));
    }

    takeScreenshot(req, res, next){
        WhatsappAccount.takeScreenshot(err => {
            if(err) return next(err);
            res.json('Screenshot created. Get it on http://localhost:3000/screenshot.png .')
        });
    }

    getUnreadUsers(req, res, next){
        debug('getUnreadUsers()');
        WhatsappAccount.getUnreadUsers(respond.bind(null, res, next));
    }

}

function respond(res, next, err, result) {
    if(err) {
        error(err);
        return next(err);
    }

    debug('Result: ', result);
    res.json(result)
}

module.exports = new WhatsappController();