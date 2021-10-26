const UserModel = require('../models/users')
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
				process.env.JWT_ACCESS_KEY,
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
		} finally {
			next()
		}
	}

	async registration(req, res, next) {
		try {
			const { email, name, password } = req.body
			const possibleNewUser = await UserModel.findOne({ email })
			if (possibleNewUser) {
				throw RestError.BadRequest('Email is already taken')
			}
			const hashPassword = await bcrypt.hash(password, 5)
			const newUser = await UserModel.create({
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
			res.json(['123'])
		} catch (err) {
			next(err)
		}
	}
	async logout(req, res, next) {
		try {
			res.json(['logout'])
		} catch (err) {
			next(err)
		}
	}
	async refresh(req, res, next) {
		try {
			res.json(['refresh'])
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new AuthController()
