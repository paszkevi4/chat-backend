const MessagesModel = require('../models/messages')
const ChatsModel = require('../models/chats')
const RestError = require('../common/restError')

class MessagesController {
	async createNewMessage(req, res, next) {
		try {
			const { hash, message } = req.body
			console.log('~ message', message)
			console.log('~ hash', hash)
			const senderId = req.user?._id
			const isDestinationCorrect = hash.includes(senderId)
			console.log('~ isDestinationCorrect', isDestinationCorrect)
			console.log('~ senderId', senderId)

			if (!isDestinationCorrect) {
				throw RestError.BadRequest('Message sent to a wrong chat')
			}

			const newMessage = await MessagesModel.create({
				hash,
				senderId,
				message,
			})
			if (!newMessage) {
				throw RestError.BadRequest('Could not create a message')
			}

			const r = await ChatsModel.findOneAndUpdate(
				{ hash },
				{ lastMessage: message },
			)

			res.data = newMessage
			res.statusCode = 201
		} catch (err) {
			next(err)
		} finally {
			next()
		}
	}
}

module.exports = new MessagesController()
