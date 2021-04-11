import express, { Router } from 'express'
import { db, _db } from './utils/config'
// import { getTempleById } from './utils/temples'
import { getDocumentByReferences } from './utils/document'
import { UserCheck } from './utils/users'

const router: Router = express.Router()

router.get('/', UserCheck, async (req, res) => {
  console.log(req.uid)

  const orderRef = db.collection('orders')
  const orderSnapshot = await orderRef
    .where('customer.cId', '==', req.uid)
    .orderBy('createdAt', 'desc')
    .get()

  const orderData = orderSnapshot.docs

  const orderRes = await Promise.all(
    orderData.map(async (d) => {
      const data = d.data()
      //console.log(data)

      const temple = await getDocumentByReferences(data.temple.tRef)
      //console.log(temple)

      return {
        _id: d.id,
        temple,
        status: data.status,
        isSuccess: data.isSuccess,
        createdAt: data.createdAt,
        modifiedAt: data.modifiedAt,
      }
    }),
  )

  return res.send({ status: 'success', payload: orderRes })
})

router.get('/:oId', async (req, res) => {
  const { oId } = req.params
  console.log(oId)

  const orderRef = db.collection('orders')
  const orderSnapshot = await orderRef.doc(oId).get()

  const data = orderSnapshot.data()
  console.log(data)

  if (!data) {
    throw new Error('Order Not Found')
  }

  const temple = await getDocumentByReferences(data.temple.tRef)

  const products = await Promise.all(
    data.products.map(async (p: any) => {
      const prod = await getDocumentByReferences(p.productRef)
      return { ...prod, quantity: p.quantity }
    }),
  )

  return res.send({
    status: 'success',
    payload: {
      _id: orderSnapshot.id,
      temple,
      products,
      status: data.status,
      isSuccess: data.isSuccess,
      createdAt: data.createdAt,
      modifiedAt: data.modifiedAt,
    },
  })
})

router.post('/', async (req, res) => {
  // console.log(req.body)
  const { order, temple, cId } = req.body
  // console.log(order)
  // console.log(temple)

  const orderFiltered = Object.entries(order)
    .map((val) => {
      const k = val[0] as string
      const v = val[1] as Object
      return {
        requestId: k,
        ...v,
      }
    })
    .filter((o: any) => o.quantity > 0)
    .map((p: any) => {
      return {
        requestId: p.requestId,
        request: db.doc(`/temples/${temple._id}/requests/${p.requestId}`),
        shopId: p.shopItem.shopId,
        productId: p.shopItem._id,
        productRef: db.doc(
          `/shops/${p.shopItem.shopId}/products/${p.shopItem._id}`,
        ),
        quantity: p.quantity,
      }
    })
  //const orderFilter = order.filter((o: any) => o.quantity > 0)

  //console.log(orderFiltered)

  const NOW = _db.Timestamp.now()
  const insertedData = {
    createdAt: NOW,
    isSuccess: false,
    modifiedAt: NOW,
    status: [{ actionId: '01', transactedAt: NOW }],
    temple: {
      tId: temple._id,
      tRef: db.doc(`/temples/${temple._id}`),
    },
    customer: {
      cId: cId,
      cRef: db.doc(`/users/${cId}`),
    },
    products: orderFiltered,
  }

  console.log(insertedData)

  const resAdded = await db.collection('orders').add(insertedData)

  console.log('Added document with ID: ', resAdded.id)

  return res.send({ status: 'success', payload: {} })
})

export default router
