import { Link } from "react-router-dom";
import { Check, Crown, Sparkles, X, CreditCard, Building } from "lucide-react";
export function PlanBadge({ plan, name }) { return <span className={`plan-badge ${plan}`}><Crown size={14} />{name || plan}</span>; }
export function UsageMeter({ label, used, limit }) { const percent = Math.min(100, limit ? used / limit * 100 : 0); return <div className="usage-meter"><div className="row-between"><span>{label}</span><strong>{used} / {limit}</strong></div><div className="usage-track" aria-label={`${label}: ${used} of ${limit} used`}><span style={{ width: `${percent}%` }} /></div></div>; }
export function UpgradePrompt({ title = "Keep your learning moving", children }) { return <aside className="upgrade-prompt"><Sparkles size={22} /><div><strong>{title}</strong><p>{children}</p><Link className="text-link" to="/settings/billing">Compare plans</Link></div></aside>; }
const money = (amount, currency) => new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount / 100);

export function PaymentMethodModal({ plan, onClose, onConfirm, pending }) {
  if (!plan) return null;
  return (
    <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }} onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" style={{ maxWidth: "480px", width: "100%", backgroundColor: "var(--bg, #fff)", borderRadius: "12px", padding: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <div className="row-between">
          <h2>Select Payment Method</h2>
          <button type="button" className="icon-button" onClick={onClose} disabled={pending} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text)" }}>
            <X size={20} />
          </button>
        </div>
        <p className="muted" style={{ marginBottom: "16px" }}>Choose how you want to pay for the {plan.name} plan.</p>
        <div className="payment-options" style={{ display: "grid", gap: "12px" }}>
          <button className="button secondary" onClick={() => onConfirm("card")} disabled={pending} style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "12px", padding: "16px", height: "auto" }}>
            <CreditCard size={24} style={{ color: "var(--primary)" }} />
            <div style={{ textAlign: "left", lineHeight: "1.4" }}>
              <strong style={{ display: "block", color: "var(--text)" }}>Pay with Card</strong>
              <span className="muted" style={{ fontSize: "0.85rem", fontWeight: "normal" }}>Monthly recurring subscription. Cancel anytime.</span>
            </div>
          </button>
          <button className="button secondary" onClick={() => onConfirm("bank_transfer")} disabled={pending} style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "12px", padding: "16px", height: "auto" }}>
            <Building size={24} style={{ color: "var(--primary)" }} />
            <div style={{ textAlign: "left", lineHeight: "1.4" }}>
              <strong style={{ display: "block", color: "var(--text)" }}>Pay with Bank Transfer</strong>
              <span className="muted" style={{ fontSize: "0.85rem", fontWeight: "normal" }}>One-time 30-day access. Does not auto-renew.</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PricingCards({ plans = [], currentPlan, onSelect, pendingPlan, authenticated = false }) { 
    return <div className="pricing-grid">
        {plans.map((plan, index) => { const current = currentPlan === plan.id; const action = current ? <button className="button secondary" disabled aria-label={`${plan.name} is your current plan`}>Current plan</button> : authenticated && plan.id !== "free" ? <button className="button" disabled={Boolean(pendingPlan)} onClick={() => onSelect(plan.id)}>{pendingPlan === plan.id ? "Opening checkout…" : currentPlan === "free" ? `Upgrade to ${plan.name}` : `Choose ${plan.name}`}</button> : authenticated ? <Link className="button secondary" to="/settings/billing">View plan details</Link> : <Link className="button" to={plan.id === "free" ? "/register" : `/register?plan=${plan.id}`}>{plan.id === "free" ? "Start Free" : `Get ${plan.name}`}</Link>; return <article className={`pricing-card ${plan.id === "growth" ? "featured" : ""}`} style={{ "--reveal-order": index }} key={plan.id}><div className="row-between"><PlanBadge plan={plan.id} name={plan.name} />{plan.id === "growth" && <span className="pricing-choice"></span>}</div><h3>{plan.name}</h3><p className="pricing-price">{money(plan.amount, plan.currency)}{plan.interval && <small>/month</small>}</p><p>{plan.description}</p><p><strong>{plan.activeCourses}</strong> active course{plan.activeCourses > 1 ? "s" : ""}</p><ul>{plan.features.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul>{action}</article>; })}</div>;
         }
