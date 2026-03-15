import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import accountRoutes from './routes/accountRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
)
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ message: 'API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/users', userRoutes)

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(error.statusCode || 500).json({
    message: error.message || 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
