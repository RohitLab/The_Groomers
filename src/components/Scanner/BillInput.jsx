import { useScanner } from '../../context/ScannerContext'

export default function BillInput() {
  const { billAmount, setBillAmount, cashbackAmount, settings, submitBill, loading } = useScanner()
  const bill = parseFloat(billAmount) || 0
  const isValid = bill >= settings.minBill

  return (
    <div className="glass-card glass-card--elevated bill-section anim-float-in">
      <h2 className="bill-section__title">Enter Bill Amount</h2>
      <p className="bill-section__desc">We'll calculate your cashback reward</p>

      <div className="bill-input-wrapper">
        <span className="bill-prefix">₹</span>
        <input
          id="bill-input"
          className="glass-input glass-input--large bill-input"
          type="number"
          placeholder="0"
          value={billAmount}
          onChange={e => setBillAmount(e.target.value)}
          autoFocus
          inputMode="numeric"
          min="0"
        />
      </div>

      {bill > 0 && (
        <div className={`bill-cashback-preview ${isValid ? 'anim-scale-in' : ''}`}>
          {isValid ? (
            <>
              <p className="bill-cashback-preview__label">You earn</p>
              <p className="bill-cashback-preview__amount anim-counter">₹{cashbackAmount.toFixed(0)} cashback</p>
            </>
          ) : (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Minimum bill amount: ₹{settings.minBill}
            </p>
          )}
        </div>
      )}

      <p className="bill-min-notice">
        {settings.cashbackPercent}% cashback on bills above ₹{settings.minBill}
        {settings.maxCashback ? ` • Max ₹${settings.maxCashback}` : ''}
      </p>

      <button
        id="bill-submit-btn"
        className="glass-btn glass-btn--primary glass-btn--large glass-btn--full"
        style={{ marginTop: 'var(--space-6)' }}
        disabled={!isValid || loading}
        onClick={submitBill}
      >
        {loading ? <span className="spinner" /> : `Claim ₹${cashbackAmount.toFixed(0)} Cashback`}
      </button>
    </div>
  )
}
