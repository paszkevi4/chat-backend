const UsersModel = require('../models/users')

class UsersController {
	async getUsers(req, res, next) {
		try {
			const users = await UsersModel.find() // check
			res.data = users
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new UsersController()
