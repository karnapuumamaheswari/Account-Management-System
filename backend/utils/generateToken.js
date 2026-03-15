import jwt from 'jsonwebtoken'

export function generateToken(user) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    secret,
    {
      expiresIn: '1d',
    },
  )
}
