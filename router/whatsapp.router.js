const express = require('express');
const router = express.Router();
const handlerWhatsapp = require('../bin/whatsapp-account.js');
const async = require('async');
const debug = require('debug')('wa:controller');
const error = require('debug')('wa:controller:error');


function respond(res, next, err, result) {
    if(err) {
        error(err);
        return next(err);
    }

    debug('Result: ', result);
    res.json(result)
}


// TODO message received from inactive contact - contact not in the list
// TODO message received from inactive contact - contact in the list
class WhatsappController{

    selectUser(req, res, next){
        const name = req.params.name;

        handlerWhatsapp.selectUser(name, respond.bind(null, res, next));
    }

    sendMessage(req, res, next){
        const name = req.params.name;
        const message = req.body;
        console.log(`Controller WhatsApp - sendMessage, user: ${name}, message: ${message}`);

        // TODO
        // 1. check correct user selected
        // 2. send message

        async.series([
            cb => handlerWhatsapp.selectUser(name, cb),
            cb => handlerWhatsapp.sendMessageText(message, cb)
        ], respond.bind(null, res, next));
    }

    takeScreenshot(req, res, next){
        handlerWhatsapp.takeScreenshot(err => {
            if(err) return next(err);
            res.json('Screenshot created. Get it on http://localhost:3000/screenshot.png .')
        });
    }

    getUnreadUsers(req, res, next){
        debug('getUnreadUsers()');
        handlerWhatsapp.getUnreadUsers(respond.bind(null, res, next));
    }

}

const controller = new WhatsappController();

router.get('/users', controller.getUnreadUsers);
router.get('/users/:name', controller.selectUser);
router.post('/users/:name/messages', controller.sendMessage);
router.post('/screenshots', controller.takeScreenshot);




module.exports = router;