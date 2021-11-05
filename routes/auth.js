const express = require('express')
const AuthController = require('../controllers/auth')
const Common = require('../common/sendResponse')

const route = express.Router()

route.post(
	'/registration',
	AuthController.registration,
	AuthController.generateTokens,
	Common.sendResponse,
)
route.post(
	'/login', 
	AuthController.login, 
	AuthController.generateTokens, 
	Common.sendResponse
)
route.post('/logout', AuthController.logout, Common.sendResponse)
route.get(
	'/refresh', 
	AuthController.refresh, 
	AuthController.generateTokens,
	Common.sendResponse, 
)

module.exports = route
