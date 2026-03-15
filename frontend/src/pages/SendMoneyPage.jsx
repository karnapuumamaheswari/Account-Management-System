import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { transferMoney } from '../services/accountService'
import { getUsers } from '../services/userService'
import { useDashboardData } from '../hooks/useDashboardData'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

function SendMoneyPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    receiverId: '',
    receiverEmail: '',
    amount: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const { balance, refresh } = useDashboardData()
  const { updateUser, user } = useAuth()

  useEffect(() => {
    let isMounted = true

    const fetchUsers = async () => {
      try {
        const response = await getUsers()
        if (isMounted) {
          setUsers(response.users)
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message)
        }
      } finally {
        if (isMounted) {
          setLoadingUsers(false)
        }
      }
    }

    fetchUsers()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query),
    )
  }, [searchTerm, users])

  const selectedUser = users.find((candidate) => candidate.id === form.receiverId)

  const handleReceiverPick = (selectedId) => {
    const pickedUser = users.find((candidate) => candidate.id === selectedId)
    setForm((current) => ({
      ...current,
      receiverId: selectedId,
      receiverEmail: pickedUser ? pickedUser.email : current.receiverEmail,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (!form.receiverId && !form.receiverEmail.trim()) {
        throw new Error('Select a receiver or enter the receiver email')
      }

      const payload = {
        amount: Number(form.amount),
      }

      if (form.receiverId) {
        payload.receiverId = form.receiverId
      } else if (form.receiverEmail.trim()) {
        payload.receiverEmail = form.receiverEmail.trim()
      }

      const response = await transferMoney(payload)
      await refresh()
      if (response.result?.sender_balance !== undefined && user) {
        updateUser({
          ...user,
          balance: Number(response.result.sender_balance),
        })
      }
      setSuccess('Transfer completed successfully.')
      setForm({ receiverId: '', receiverEmail: '', amount: '' })
      setSearchTerm('')
      navigate('/statement')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="feature-grid">
      <article className="feature-card stack">
        <div className="section-head">
          <div>
            <h2>Send Money</h2>
            <p>Choose a registered user and transfer from your available balance.</p>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-label">Current balance</span>
          <span className="summary-value">{formatCurrency(balance ?? 0)}</span>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="search">Search registered users</label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or email"
              disabled={loadingUsers}
            />
          </div>

          <div className="field">
            <label htmlFor="receiverId">Receiver</label>
            <select
              id="receiverId"
              name="receiverId"
              value={form.receiverId}
              onChange={(event) => handleReceiverPick(event.target.value)}
              disabled={loadingUsers}
            >
              <option value="">Select a user from the list</option>
              {filteredUsers.map((userOption) => (
                <option key={userOption.id} value={userOption.id}>
                  {userOption.name} ({userOption.email})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="receiverEmail">Or enter receiver email</label>
            <input
              id="receiverEmail"
              name="receiverEmail"
              type="email"
              value={form.receiverEmail}
              onChange={handleChange}
              placeholder="receiver@example.com"
            />
          </div>

          {selectedUser ? (
            <div className="receiver-preview">
              <span className="receiver-name">{selectedUser.name}</span>
              <span className="receiver-email">{selectedUser.email}</span>
            </div>
          ) : null}

          {!loadingUsers && !users.length ? (
            <div className="empty-state compact">
              <p>No other registered users found yet. Create a second account or use receiver email after that account exists.</p>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount to transfer"
              required
            />
          </div>

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Processing...' : 'Transfer Funds'}
          </button>
        </form>
      </article>

      <article className="feature-card stack">
        <h2>Transfer rules</h2>
        <p className="muted">
          The sender must have sufficient balance, the receiver must already exist,
          and the backend records both debit and credit rows for the statement.
        </p>
        <div className="panel mini-stat">
          <span className="summary-label">Receivers loaded</span>
          <h3>{loadingUsers ? 'Loading...' : users.length}</h3>
        </div>
        <div className="panel mini-stat">
          <span className="summary-label">Receiver selection</span>
          <h3>{users.length ? 'Dropdown + email fallback' : 'Email fallback ready'}</h3>
          <span className="muted">Search the list or type the receiver email directly.</span>
        </div>
        <div className="panel mini-stat">
          <span className="summary-label">Validation</span>
          <h3>Server enforced</h3>
          <span className="muted">JWT route protection and balance checks happen in the API.</span>
        </div>
      </article>
    </section>
  )
}

export default SendMoneyPage
