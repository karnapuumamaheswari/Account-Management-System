import jwt from 'jsonwebtoken'
export function protect(request, response, next) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Authorization token missing' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    request.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    }
    next()
  } catch {
    response.status(401).json({ message: 'Invalid or expired token' })
  }
}
