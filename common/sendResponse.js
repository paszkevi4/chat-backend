const RestError = require('../common/restError')

class SendResponseController {
	async sendResponse(req, res, next) {
		res.status(res.statusCode || 200)
		const responseData = {
			data: res.data,
			warnings: res.warnings && res.warnings.length ? res.warnings : null,
			status: res.statusCode || 200,
			success: true,
		}
		if (res.accessToken) responseData.accessToken = res.accessToken
		if (res.refreshToken) {
			responseData.refreshToken = res.refreshToken
		}
		res.json(responseData)
		return
	}
	async checkIsAuth(req, res, next) {
		try {
			// add token to postman headers
			const authorizationHeader = req.headers.authorization // check
			if (!authorizationHeader) {
				throw RestError.UnauthorizedError('Auth') 
			}
			const accessToken = authorizationHeader.split(' ')[1]
			if (!accessToken) {
				throw RestError.UnauthorizedError('Auth') 
			}
			const userData = await AuthController.validateToken(accessToken, 'access')
			if (!userData) {
				throw RestError.UnauthorizedError('Auth') 
			}

			req.user = userData // check
			next()

		} catch (err) {
			next(err)
		}
	}
	// async restError(message = 'Unexpected error', status = 500) {
	// 	return res.status(500).json({ message })
	// }
}

module.exports = new SendResponseController()
