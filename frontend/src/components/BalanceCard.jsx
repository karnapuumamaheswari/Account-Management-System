import { formatCurrency } from '../utils/formatters'

function BalanceCard({ balance, name }) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <span className="eyebrow">Live account overview</span>
        <h1>{formatCurrency(balance ?? 0)}</h1>
        <p>
          {name}, this is your current available balance. Every transfer updates
          the statement with debit and credit entries so the ledger stays clear.
        </p>
        <div className="hero-actions">
          <div className="welcome-chip">Initial signup balance: {formatCurrency(10000)}</div>
        </div>
      </div>

      <div className="summary-card">
        <span className="summary-label">Available Funds</span>
        <span className="summary-value">{formatCurrency(balance ?? 0)}</span>
        <span className="summary-label">JWT-protected session is active</span>
        <div className="summary-accent" />
      </div>
    </section>
  )
}

export default BalanceCard
