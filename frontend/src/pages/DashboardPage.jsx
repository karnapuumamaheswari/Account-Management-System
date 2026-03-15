import { Link } from 'react-router-dom'
import BalanceCard from '../components/BalanceCard'
import StatementTable from '../components/StatementTable'
import { useDashboardData } from '../hooks/useDashboardData'
import { useAuth } from '../context/AuthContext'

function DashboardPage() {
  const { user } = useAuth()
  const { balance, transactions, loading, error, refresh } = useDashboardData()

  return (
    <>
      <BalanceCard balance={balance} name={user?.name} />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="stat-grid">
        <div className="panel mini-stat">
          <span className="summary-label">Recent transaction count</span>
          <h3>{transactions.length}</h3>
          <span className="muted">Latest ledger entries shown below.</span>
        </div>
        <div className="panel mini-stat">
          <span className="summary-label">Primary action</span>
          <h3>Send Money</h3>
          <span className="muted">Transfer funds to another registered user.</span>
        </div>
        <div className="panel mini-stat">
          <span className="summary-label">Statement access</span>
          <h3>Always available</h3>
          <span className="muted">Every transfer creates debit and credit entries.</span>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <div className="section-head">
            <div>
              <h2>Move funds instantly</h2>
              <p>Transfers are validated for user existence and sufficient balance.</p>
            </div>
          </div>
          <Link className="button" to="/send-money">
            Go to Send Money
          </Link>
        </article>
        <article className="feature-card">
          <div className="section-head">
            <div>
              <h2>Review full statement</h2>
              <p>Open the full table view for your transaction history.</p>
            </div>
          </div>
          <div className="inline-row">
            <Link className="button-secondary" to="/statement">
              View Statement
            </Link>
            <button className="button-ghost" type="button" onClick={refresh}>
              Refresh data
            </button>
          </div>
        </article>
      </section>

      <StatementTable transactions={transactions.slice(0, 5)} loading={loading} />
    </>
  )
}

export default DashboardPage
