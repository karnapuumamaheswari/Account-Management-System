import { formatCurrency, formatDateTime } from '../utils/formatters'

function StatementTable({ transactions, loading }) {
  if (loading) {
    return (
      <div className="table-card">
        <p className="spinner-text">Loading transaction history...</p>
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <p>No transactions yet. Your credits and debits will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="table-card">
      <div className="table-head">
        <h2>Account Statement</h2>
        <p>Credits are green, debits are red, and each row shows the running balance.</p>
      </div>
      <div className="table-wrapper">
        <table className="statement-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>From</th>
              <th>To</th>
              <th>Balance After Transaction</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDateTime(transaction.created_at)}</td>
                <td>
                  <span
                    className={`type-badge ${
                      transaction.transaction_type === 'credit'
                        ? 'type-credit'
                        : 'type-debit'
                    }`}
                  >
                    {transaction.transaction_type}
                  </span>
                </td>
                <td>{formatCurrency(transaction.amount)}</td>
                <td>{transaction.from_name}</td>
                <td>{transaction.to_name}</td>
                <td>{formatCurrency(transaction.balance_after_transaction)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StatementTable
