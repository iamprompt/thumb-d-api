import express, { Router } from 'express'
import { db } from './utils/config'

const router: Router = express.Router()

router.get('/', async (req, res) => {
  const templeRef = db.collection('temples')
  const templeSnapshot = await templeRef.get()

  const templeRes = await Promise.all(
    templeSnapshot.docs.map(async (d) => {
      const templeDocsRef = templeRef.doc(d.id)
      const requestRef = templeDocsRef.collection('requests')
      const requestSnapshot = await requestRef.get()
      const requestData = requestSnapshot.docs.map((d) => {
        return {
          _id: d.id,
          ...d.data(),
        }
      })

      return {
        _id: d.id,
        ...d.data(),
        requests: requestData,
      }
    }),
  )

  return res.send({ status: 'success', payload: templeRes })
})

router.get('/:tId', async (req, res) => {
  const { tId } = req.params

  const templeRef = db.collection('temples')
  const templeDocsRef = templeRef.doc(tId)
  const templeSnapshot = await templeDocsRef.get()

  if (!templeSnapshot.exists)
    return res.status(400).json({
      status: 'error',
      payload: `The temple (ID: ${tId}) is not exist.`,
    })

  const requestRef = templeDocsRef.collection('requests')
  const requestSnapshot = await requestRef.get()

  const templeData = templeSnapshot.data()
  const requestData = await Promise.all(
    requestSnapshot.docs.map(async (d) => {
      const shopRef = db.collectionGroup('products')
      const searchSnapshot = await shopRef
        .where('name', '==', d.data().name)
        .get()

      const matchedProduct = await Promise.all(
        searchSnapshot.docs.map(async (s) => {
          const shopSnapshot = await s.ref.parent.parent?.get()
          const shopData = shopSnapshot?.data()

          return {
            shopId: shopSnapshot?.id,
            shopName: shopData?.name,
            _id: s.id,
            ...s.data(),
          }
        }),
      )

      return {
        _id: d.id,
        ...d.data(),
        shopItem: matchedProduct[0],
      }
    }),
  )

  const templeRes = {
    _id: templeSnapshot.id,
    ...templeData,
    requests: requestData,
  }

  return res.send({ status: 'success', payload: templeRes })
})

export default router
