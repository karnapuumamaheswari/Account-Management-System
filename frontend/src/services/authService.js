import { api } from './api'

export function signupUser(payload) {
  return api.post('/auth/signup', payload)
}

export function loginUser(payload) {
  return api.post('/auth/login', payload)
}
