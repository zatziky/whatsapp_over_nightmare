const express = require('express');
const router = express.Router();
const debug = require('debug')('wa:controller');
const error = require('debug')('wa:controller:error');
const controllerWhatsapp = require('./whatsapp.controller');

router.get('/users', controllerWhatsapp.getUnreadUsers);
router.get('/users/:name', controllerWhatsapp.selectUser);
router.post('/users/:name/messages', controllerWhatsapp.sendMessage);
router.post('/screenshots', controllerWhatsapp.takeScreenshot);
router.post('/accounts/:phoneNumber', controllerWhatsapp.runAccount);

module.exports = router;