class UsersController {
	async getUsers(req, res, next) {
		try {
			res.json(['123'])
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new UsersController()
