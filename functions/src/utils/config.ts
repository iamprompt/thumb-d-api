import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

admin.initializeApp(functions.config().firebase)

const db = admin.firestore()
const _db = admin.firestore

const auth = admin.auth()
const _auth = admin.auth

export { admin, db, _db, auth, _auth }
