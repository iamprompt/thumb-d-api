import { Request, Response, NextFunction } from 'express'
import { auth } from './config'

export const UserCheck = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.headers)
  if (!req.headers.authorization) {
    res.status(403).send({ status: 'error', payload: 'Need Authorization' })
  }

  const verification = await auth.verifyIdToken(
    req.headers.authorization as string,
  )

  console.log(verification)

  req.uid = verification.uid

  return next()
}
