const getDocumentByReferences = async (
  ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
) => {
  const docSnapshot = await ref.get()
  const docRes = docSnapshot.data()
  return {
    _id: docSnapshot.id,
    ...docRes,
  }
}

export { getDocumentByReferences }
