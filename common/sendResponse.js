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
	async restError(message = 'Unexpected error', status = 500) {
		return res.status(500).json({ message })
	}
}

module.exports = new SendResponseController()
