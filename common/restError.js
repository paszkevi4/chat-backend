class RestError extends Error {
	status
	errors

	constructor(status = 500, message = 'Unexpected error', errors = []) {
		super(message)
		this.status = status
		this.errors = errors
	}

	static UnauthorizedError() {
		return new RestError(401, 'User is not authorized')
	}

	static BadRequest(message, errors) {
		return new RestError(400, message, errors)
	}
}

module.exports = RestError
