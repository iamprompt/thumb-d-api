import { db } from '../utils/config'

const getTempleById = async (tId: string) => {
  const templeRef = db.collection('temples')
  const templeDocsRef = templeRef.doc(tId)
  const templeSnapshot = await templeDocsRef.get()

  if (!templeSnapshot.exists)
    throw new Error('The temple (ID: ${tId}) is not exist.')

  const templeData = templeSnapshot.data()

  const templeRes = {
    _id: templeSnapshot.id,
    ...templeData,
  }

  return templeRes
}

export { getTempleById }
