const { Schema, model } = require('mongoose')

const ChatSchema = new Schema({
	hash: { type: String, unique: true, required: true },
	participants: { type: Array, required: true },
	lastMessage: { type: String, required: true, default: '' },
})

module.exports = model('Chat', ChatSchema)
