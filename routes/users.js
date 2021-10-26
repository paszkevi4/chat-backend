const express = require('express')
const Common = require('../controllers/users')

const route = express.Router()

route.get('/', Common.getUsers)

module.exports = route
