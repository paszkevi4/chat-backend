require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')

const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')
const RestError = require('./common/restError')

const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.use('/auth', authRouter)
app.use('/users', usersRouter)

// error handler
app.use((err, req, res, next) => {
	if (err instanceof RestError) {
		res.status(err.status || 500)
		res.json({
			message: err.message,
			errors: err.errors,
			success: false,
		})
		return
	} else {
		res.status(500)
		res.json({
			message: 'Unexpected error',
		})
	}
})

const start = async () => {
	try {
		await mongoose.connect(process.env.DB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		app.listen(PORT, () => console.log(`App started on port ${PORT}`))
	} catch (e) {
		console.log('Error: ', e)
	}
}

start()
