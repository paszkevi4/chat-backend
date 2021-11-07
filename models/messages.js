const { Schema, model } = require('mongoose')

const MessageSchema = new Schema(
	{
		hash: { type: String, required: true },
		senderId: { type: String, required: true },
		message: { type: String, required: true, default: '' },
	},
	{
		timestamps: true,
	},
)

module.exports = model('Message', MessageSchema)
