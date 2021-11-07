const express = require('express')
const MessagesController = require('../controllers/messages')
const Common = require('../common/sendResponse')

const route = express.Router()

route.post(
	'/',
	Common.checkIsAuth,
	MessagesController.createNewMessage,
	Common.sendResponse,
)

module.exports = route
