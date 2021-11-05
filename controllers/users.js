const UsersModel = require('../models/users')

class UsersController {
	async getUsers(req, res, next) {
		try {
			const users = await UsersModel.find()
			res.data = users

			next()
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new UsersController()
