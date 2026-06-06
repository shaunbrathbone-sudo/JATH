"use client";

interface PriceBreakdown {
  basePrice: number;
  modifiers: { label: string; amount: number; type: string }[];
  wasteCost: number;
  subtotal: number;
  depositAmount: number;
  total: number;
}

interface Props {
  price: PriceBreakdown | null;
  loading: boolean;
  productName: string;
}

export default function PriceSummary({ price, loading, productName }: Props) {
  return (
    <div className="price-summary" aria-live="polite" aria-label="Price summary">
      <div className="price-summary__header">
        <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>£</span>
        <h3>Price Summary</h3>
      </div>

      {!price && !loading && (
        <div className="price-summary__empty">
          <p>Complete the form to see your price</p>
        </div>
      )}

      {loading && (
        <div className="price-summary__loading">
          <div className="price-summary__spinner" />
          <p>Calculating...</p>
        </div>
      )}

      {price && !loading && (
        <>
          <div className="price-summary__product">
            <span>{productName}</span>
          </div>

          <div className="price-summary__lines">
            {price.modifiers
              .filter((m) => m.type === "add")
              .map((mod, i) => (
                <div key={i} className="price-summary__line">
                  <span>{mod.label}</span>
                  <span>£{mod.amount.toFixed(2)}</span>
                </div>
              ))}

            {price.modifiers.some((m) => m.type === "multiply") && (
              <>
                {price.modifiers
                  .filter((m) => m.type === "multiply")
                  .map((mod, i) => (
                    <div key={`m-${i}`} className="price-summary__line price-summary__line--modifier">
                      <span>{mod.label}</span>
                      <span>×{mod.amount.toFixed(2)}</span>
                    </div>
                  ))}
              </>
            )}

            {price.wasteCost > 0 && (
              <div className="price-summary__line">
                <span>Waste Disposal</span>
                <span>£{price.wasteCost.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="price-summary__total">
            <div className="price-summary__total-row">
              <span>Total</span>
              <span className="price-summary__total-amount">
                £{price.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="price-summary__deposit">
            <div className="price-summary__deposit-row">
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                50% Deposit to Book
              </span>
              <span className="price-summary__deposit-amount">
                £{price.depositAmount.toFixed(2)}
              </span>
            </div>
            <p className="price-summary__deposit-note">
              Remaining £{(price.total - price.depositAmount).toFixed(2)} on completion
            </p>
          </div>
        </>
      )}
    </div>
  );
}
