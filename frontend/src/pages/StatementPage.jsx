import StatementTable from '../components/StatementTable'
import { useDashboardData } from '../hooks/useDashboardData'

function StatementPage() {
  const { transactions, loading, error } = useDashboardData()

  return (
    <section className="stack">
      <div className="section-head">
        <div>
          <h2>Full Account Statement</h2>
          <p className="muted">
            Review all transaction rows with sender, receiver, amount, and running balance.
          </p>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      <StatementTable transactions={transactions} loading={loading} />
    </section>
  )
}

export default StatementPage
