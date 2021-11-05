const RestError = require('../common/restError')
const AuthController = require('../controllers/auth')

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
			const authorizationHeader = req.headers.authorization
			if (!authorizationHeader) {
				throw RestError.UnauthorizedError('Auth')
			}
			const accessToken = authorizationHeader.split(' ')[1]
			if (!accessToken) {
				throw RestError.UnauthorizedError('Auth')
			}
			const userData = await AuthController.validateAccessToken(
				accessToken,
			)
			if (!userData) {
				throw RestError.UnauthorizedError('Auth')
			}

			req.user = userData
			next()
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new SendResponseController()
