const express = require('express');
const router = express.Router();
const handlerWhatsapp = require('../bin/whatsapp.handler');

class WhatsappController{

    selectUser(req, res, next){
        const name = req.params.name;

        handlerWhatsapp.selectUser('Matous Kucera')
        res.json('ok')
    }

}

const controller = new WhatsappController();

router.get('/user/:name', controller.selectUser);




module.exports = router;