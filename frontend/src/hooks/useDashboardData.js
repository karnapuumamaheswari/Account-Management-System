import { useEffect, useState } from 'react'
import { getBalance, getStatement } from '../services/accountService'

export function useDashboardData() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')

    try {
      const [balanceResponse, statementResponse] = await Promise.all([
        getBalance(),
        getStatement(),
      ])
      setBalance(Number(balanceResponse.balance))
      setTransactions(statementResponse.transactions)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return {
    balance,
    transactions,
    loading,
    error,
    refresh,
  }
}
