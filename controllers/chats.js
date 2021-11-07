const ChatsModel = require('../models/chats')
const RestError = require('../common/restError')

class ChatsController {
	async createNewChat(req, res, next) {
		try {
			const { participants } = req.body
			const hash = participants.sort().join('_')
			const possibleNewChat = await ChatsModel.findOne({ hash })
			if (possibleNewChat) {
				throw RestError.BadRequest('Chat already exists')
			}
			const newChat = await ChatsModel.create({
				hash,
				participants,
			})
			if (!newChat) {
				throw RestError.BadRequest('Could not create chat')
			}
			res.data = newChat
			res.statusCode = 201
		} catch (err) {
			next(err)
		} finally {
			next()
		}
	}
	async getMyChats(req, res, next) {
		try {
			const userId = req.user?._id
			const myChats = await ChatsModel.find({
				participants: userId,
			})
			res.data = myChats
			res.statusCode = 201
		} catch (e) {
			next(err)
		} finally {
			next()
		}
	}
}

module.exports = new ChatsController()
