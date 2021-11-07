const express = require('express')
const ChatsController = require('../controllers/chats')
const Common = require('../common/sendResponse')

const route = express.Router()

route.post(
	'/',
	Common.checkIsAuth,
	ChatsController.createNewChat,
	Common.sendResponse,
)

route.get(
	'/mychats',
	Common.checkIsAuth,
	ChatsController.getMyChats,
	Common.sendResponse,
)

module.exports = route
