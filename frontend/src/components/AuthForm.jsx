function AuthForm({
  title,
  subtitle,
  fields,
  onSubmit,
  submitLabel,
  loading,
  error,
  footer,
}) {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow">Bank-grade demo flow</span>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <form className="auth-form" onSubmit={onSubmit}>
          {fields}
          <button className="button" disabled={loading} type="submit">
            {loading ? 'Please wait...' : submitLabel}
          </button>
        </form>

        {footer}
      </div>
    </div>
  )
}

export default AuthForm
