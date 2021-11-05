const express = require('express')
const UsersController = require('../controllers/users')
const Common = require ('../common/sendResponse')

const route = express.Router()

route.get('/', Common.checkIsAuth, UsersController.getUsers) // check 30s 72m

module.exports = route
