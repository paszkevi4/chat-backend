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
					expiresIn: '10m',
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

	async validateToken(token, type = 'refresh') {
		try {
			const userData = jwt.verify(
				token,
				type === 'access' ? process.env.JWT_ACCESS_KEY : process.env.JWT_REFRESH_KEY,
			)
			const isTokenExit = await tokenModel.findOne({
				refreshToken
			})
			if (!userData || !isTokenExit) {
				throw RestError.UnauthorizedError('User is not authorized')
			}
			return userData
		} catch (err) {
			next(err) // check
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
				throw RestError.BadRequest('No registered user with this email') // check
			}
			const isPassCorrect = bcrypt.compare(password, foundUser.password)
			if (!isPassCorrect) {
				throw RestError.BadRequest('Wrong password') // check
			}
			res.data = foundUser // check
			res.statusCode = 201 // check
		} catch (err) {
			next(err)
		}
	}
	async logout(req, res, next) {
		try {
			const {refreshToken} = req.cookies
			const deletedToken = await tokenModel.deleteOne({
				refreshToken
			})
			if (!deletedToken) {
				throw RestError.BadRequest('Could not delete token')
			}

			res.clearCookie('refreshToken')
			res.statusCode = 200

		} catch (err) {
			next(err)
		}
	}
	async refresh(req, res, next) {
		try {
			const {refreshToken} = req.cookies
			if (!refreshToken) {
				throw RestError.UnauthorizedError('User is not authorized')
			}
			const userData = await this.validateToken(token, 'refresh') // check
			const refreshedUserData = await UsersModel.findById(userData._id) // check

			res.data = refreshedUserData // check
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new AuthController()
