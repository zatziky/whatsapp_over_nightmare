const express = require('express');
const router = express.Router();
const handlerWhatsapp = require('../bin/whatsapp.handler');
const async = require('async');


function respond(res, next, err, result) {
    if(err) return next(err);
    res.json(result)
}

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
        handlerWhatsapp.takeScreenshot((err, screenshotBuffer) => {
            res.json('Screenshot created. Get it on http://localhost:3000/screenshot.png .')
        });
    }

}

const controller = new WhatsappController();

router.get('/user/:name', controller.selectUser);
router.post('/user/:name/message', controller.sendMessage);
router.post('/screenshot', controller.takeScreenshot);




module.exports = router;