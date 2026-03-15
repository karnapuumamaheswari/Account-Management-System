import bcrypt from 'bcryptjs'
import { supabase } from '../config/supabaseClient.js'
import { generateToken } from '../utils/generateToken.js'

const INITIAL_BALANCE = 10000

export async function signup(request, response) {
  const { name, email, password } = request.body

  if (!name || !email || !password) {
    return response.status(400).json({ message: 'Name, email, and password are required' })
  }

  if (password.length < 6) {
    return response.status(400).json({ message: 'Password must be at least 6 characters long' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: existingUser, error: existingUserError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingUserError) {
    return response.status(500).json({ message: existingUserError.message })
  }

  if (existingUser) {
    return response.status(409).json({ message: 'Email is already registered' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { data: createdUser, error: createError } = await supabase
    .from('users')
    .insert({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      balance: INITIAL_BALANCE,
    })
    .select('id, name, email, balance, created_at')
    .single()

  if (createError) {
    return response.status(500).json({ message: createError.message })
  }

  const token = generateToken(createdUser)

  response.status(201).json({
    token,
    user: createdUser,
  })
}

export async function login(request, response) {
  const { email, password } = request.body

  if (!email || !password) {
    return response.status(400).json({ message: 'Email and password are required' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, password, balance, created_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error) {
    return response.status(500).json({ message: error.message })
  }

  if (!user) {
    return response.status(401).json({ message: 'Invalid email or password' })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return response.status(401).json({ message: 'Invalid email or password' })
  }

  const token = generateToken(user)

  response.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      created_at: user.created_at,
    },
  })
}
