const express = require('express')
const UsersController = require('../controllers/users')
const Common = require('../common/sendResponse')

const route = express.Router()

route.get(
	'/',
	Common.checkIsAuth,
	UsersController.getUsers,
	Common.sendResponse,
)

route.get(
	'/user/:id',
	Common.checkIsAuth,
	UsersController.getUser,
	Common.sendResponse,
)

module.exports = route
