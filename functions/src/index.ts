import * as functions from 'firebase-functions'
import express, { Application, Router, Request, Response } from 'express'
import cors from 'cors'

import Shops from './shops'
import Temples from './temples'

const app: Application = express()
const router: Router = express.Router()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)

router.use('/shops', Shops)
router.use('/temples', Temples)

router.get('/', (req: Request, res: Response) => {
  return res.send({ status: 'success', payload: 'API is working' })
})

exports.api = functions.https.onRequest(app)
