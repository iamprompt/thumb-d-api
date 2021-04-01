import express, { Router } from 'express'
import { admin } from './utils/config'

const router: Router = express.Router()

router.get('/', async (req, res) => {
  const shopRef = admin.firestore().collection('shops')
  const shopSnapshot = await shopRef.get()

  const shopRes = shopSnapshot.docs.map((d) => {
    return {
      _id: d.id,
      ...d.data(),
    }
  })

  return res.send({ status: 'success', payload: shopRes })
})

export default router
