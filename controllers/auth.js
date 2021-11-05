const UsersModel = require('../models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const tokenModel = require('../models/tokens')
const RestError = require('../common/restError')

class AuthController {
	async generateTokens(req, res, next) {
		try {
			const { email, _id } = res.data
			const accessToken = jwt.sign(
				{ email, _id },
				process.env.JWT_ACCESS_KEY,
				{
					expiresIn: '1m',
				},
			)
			const refreshToken = jwt.sign(
				{ email, _id },
				process.env.JWT_REFRESH_KEY,
				{
					expiresIn: '12h',
				},
			)

			const oldToken = await tokenModel.findOne({
				user: _id,
			})
			if (oldToken) {
				oldToken.refreshToken = refreshToken
				oldToken.save()
			}
			if (!oldToken) {
				await tokenModel.create({
					user: _id,
					refreshToken,
				})
			}

			res.accessToken = accessToken
			res.refreshToken = refreshToken
			res.cookie('refreshToken', res.refreshToken, {
				maxAge: 43200000, // 12h
				httpOnly: true,
			})
			res.statusCode = 201
		} catch (err) {
			next(err)
		} finally {
			next()
		}
	}

	async validateAccessToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_ACCESS_KEY)
			if (!userData) {
				throw RestError.UnauthorizedError('User is not authorized')
			}
			return userData
		} catch (err) {
			next(err)
		}
	}

	async validateRefreshToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_REFRESH_KEY)
			const isTokenExit = await tokenModel.findOne({
				refreshToken: token,
			})
			if (!userData || !isTokenExit) {
				throw RestError.UnauthorizedError('User is not authorized')
			}
			return userData
		} catch (err) {
			next(err)
		}
	}

	async registration(req, res, next) {
		try {
			const { email, name, password } = req.body
			const possibleNewUser = await UsersModel.findOne({ email })
			if (possibleNewUser) {
				throw RestError.BadRequest('Email is already taken')
			}
			const hashPassword = await bcrypt.hash(password, 5)
			const newUser = await UsersModel.create({
				email,
				name,
				password: hashPassword,
			})
			if (!newUser) {
				throw RestError.BadRequest('Could not create user')
			}
			res.data = newUser
			res.statusCode = 201
		} catch (err) {
			next(err)
		} finally {
			next()
		}
	}
	async login(req, res, next) {
		try {
			const { email, password } = req.body
			const foundUser = await UsersModel.findOne({ email })
			if (!foundUser) {
				throw RestError.BadRequest('No registered user with this email')
			}
			const isPassCorrect = await bcrypt.compare(
				password,
				foundUser.password,
			)
			if (!isPassCorrect) {
				throw RestError.BadRequest('Wrong password')
			}
			res.data = foundUser // check
			res.statusCode = 201

			next()
		} catch (err) {
			next(err)
		}
	}
	async logout(req, res, next) {
		try {
			const { refreshToken } = req.cookies
			const deleted = await tokenModel.deleteOne({
				refreshToken,
			})
			if (deleted.deletedCount === 0) {
				throw RestError.BadRequest('Could not delete token')
			}

			res.clearCookie('refreshToken')
			res.statusCode = 200

			next()
		} catch (err) {
			next(err)
		}
	}
	async refresh(req, res, next) {
		try {
			const { refreshToken } = req.cookies
			if (!refreshToken) {
				throw RestError.UnauthorizedError('User is not authorized')
			}
			const AC = new AuthController()
			const userData = await AC.validateRefreshToken(refreshToken)
			const refreshedUserData = await UsersModel.findById(userData._id)

			res.data = refreshedUserData

			next()
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new AuthController()
