const express = require('express');
const router = express.Router();
const debug = require('debug')('wa:controller');
const error = require('debug')('wa:controller:error');
const controllerWhatsapp = require('./whatsapp.controller');
const serviceAccounts = require('./accounts.service');

function middlewareGetAccount(req, res, next) {
    const phoneNumber = req.params.phoneNumber;
    debug(`middleware - getAccount() - phoneNumber: ${phoneNumber}`);
    serviceAccounts.getAccount(phoneNumber, (err, account) => {
        if (err) return next(err);

        req.account = account;
        next();
    });
}

router.use('/accounts/:phoneNumber/users', middlewareGetAccount);
router.use('/accounts/:phoneNumber/screenshots', middlewareGetAccount);

router.post('/accounts/:phoneNumber', controllerWhatsapp.runAccount);
router.get('/accounts/:phoneNumber/users', controllerWhatsapp.getUnreadUsers);
router.get('/accounts/:phoneNumber/users/:name', controllerWhatsapp.selectUser);
router.post('/accounts/:phoneNumber/users/:name/messages', controllerWhatsapp.sendMessage);
router.post('/accounts/:phoneNumber/screenshots', controllerWhatsapp.takeScreenshot);

module.exports = router;
