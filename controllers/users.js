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
	async getUser(req, res, next) {
		try {
			const { id } = req.params
			const user = await UsersModel.findById(id)
			res.data = {
				name: user.name,
				email: user.email,
			}

			next()
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new UsersController()
