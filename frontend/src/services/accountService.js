import { api } from './api'

export function getBalance() {
  return api.get('/account/balance')
}

export function getStatement() {
  return api.get('/account/statement')
}

export function transferMoney(payload) {
  return api.post('/account/transfer', payload)
}
