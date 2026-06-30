import express from 'express'
import routes from './routes.js'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// CORS: se ALLOWED_ORIGINS estiver vazio, libera todas as origens (modo dev)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : []

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        callback(new Error(`Origem não permitida pelo CORS: ${origin}`))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}))

app.use(express.json())

// Serve o frontend de API_REST/public
app.use(express.static(join(__dirname, '..', 'API_REST', 'public')))

app.use(routes)

export default app
