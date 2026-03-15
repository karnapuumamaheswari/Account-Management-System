import { api } from './api'

export function getUsers() {
  return api.get('/users')
}
