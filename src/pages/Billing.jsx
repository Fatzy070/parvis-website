import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useBilling, useBillingManagement, useCancelSubscription, useCheckout, usePlans } from "../queries";
import { ErrorState, FormError, PageHeading, PageSkeleton } from "../components/UI";
import { PlanBadge, PricingCards, UsageMeter } from "../components/BillingUI";
const labels = { ai_summary: "AI summaries", ask_ai: "Ask AI", study_notes: "Study Notes", practice_quiz: "Practice quizzes", practical_question: "Practical questions", practical_feedback: "Practical feedback" };
export default function Billing() {
  const query = useBilling(); const plans = usePlans(); const checkout = useCheckout(); const cancel = useCancelSubscription(); const manage = useBillingManagement(); const [confirmCancel, setConfirmCancel] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams(); const startedIntent = useRef(false);
  const intendedPlan = ["growth", "pro"].includes(searchParams.get("plan")) ? searchParams.get("plan") : null;
  useEffect(() => {
    if (!intendedPlan || startedIntent.current || !query.data || query.data.plan !== "free") return;
    startedIntent.current = true;
    setSearchParams({}, { replace: true });
    checkout.mutate(intendedPlan);
  }, [checkout, intendedPlan, query.data, setSearchParams]);
  if (query.isPending || plans.isPending) return <PageSkeleton />;
  if (query.isError || plans.isError) return <ErrorState error={query.error || plans.error} retry={() => { query.refetch(); plans.refetch(); }} />;
  const billing = query.data; const plan = plans.data.items.find((item) => item.id === billing.plan); const price = new Intl.NumberFormat("en-NG", { style: "currency", currency: plan.currency, maximumFractionDigits: 0 }).format(plan.amount / 100);
  
  const underlyingSub = billing.subscription;
  const canManage = underlyingSub?.isManageable;

  return <div className="billing-page">
    <section className="billing-current">
      <div>
        <p className="eyebrow">CURRENT PLAN</p>
        <div className="billing-title">
          <h2>{plan.name}</h2>
          <PlanBadge plan={billing.plan} name={plan.name} />
        </div>

        {!billing.activeGrants?.length && <p>{price}{billing.plan !== "free" && "/month"}</p>}
        {billing.plan !== "free" && (
          <p className="muted">
            Status: <span style={{ textTransform: "capitalize" }}>{billing.status.replace("_", " ")}</span>
            {underlyingSub?.nextPaymentDate && !underlyingSub?.cancelAtPeriodEnd ? ` · Renews ${new Date(underlyingSub.nextPaymentDate).toLocaleDateString()}` : ""}
          </p>
        )}
        
        {underlyingSub?.cancelAtPeriodEnd && (
          <p className="notice">
            Renewal is cancelled. Paid {underlyingSub.plan} access remains available through {new Date(underlyingSub.currentPeriodEnd).toLocaleDateString()}.
          </p>
        )}

        {billing.activeGrants?.length > 0 && billing.activeGrants.map(g => (
          <p key={g._id} className="notice">
            Complimentary {g.plan === "pro" ? "Pro" : "Growth"} access · Expires {new Date(g.expiresAt).toLocaleDateString()}
          </p>
        ))}
      </div>

      {canManage && (
        <div className="billing-actions" style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", minWidth: "260px" }}>
          <button className="button secondary full" onClick={() => manage.mutate()} disabled={manage.isPending}>
            {manage.isPending ? "Loading..." : "Manage subscription"}
          </button>
          
          {!underlyingSub?.cancelAtPeriodEnd && (
            confirmCancel ? (
              <div className="cancel-confirm" style={{ border: "1px solid var(--line)", padding: "16px", borderRadius: "8px", background: "var(--surface)", marginTop: "4px", width: "100%" }}>
                <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text)" }}>
                  Cancel renewal? Your current paid access will remain available until {new Date(underlyingSub.currentPeriodEnd).toLocaleDateString()}. You won't be charged again after that.
                </p>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button className="button small" onClick={() => setConfirmCancel(false)} disabled={cancel.isPending}>
                    Keep subscription
                  </button>
                  <button className="button secondary small" style={{ color: "var(--error)", borderColor: "var(--error)" }} onClick={() => cancel.mutate()} disabled={cancel.isPending}>
                    {cancel.isPending ? "Cancelling..." : "Cancel renewal"}
                  </button>
                </div>
              </div>
            ) : (
              <button className="button secondary full" style={{ color: "var(--error)", borderColor: "transparent", background: "transparent" }} onClick={() => setConfirmCancel(true)} disabled={manage.isPending}>
                Cancel renewal
              </button>
            )
          )}
        </div>
      )}
    </section>
    
    <FormError error={checkout.error || cancel.error || manage.error} />
    <section><h2>Your usage</h2><div className="usage-grid"><UsageMeter label="Active courses" {...billing.activeCourses} />{Object.entries(billing.usage).map(([key, value]) => <UsageMeter key={key} label={labels[key] || key} {...value} />)}</div><p className="field-hint">Provider-backed AI actions count during your current usage period. Cached results do not reduce your allowance.</p></section>
    <section><PageHeading eyebrow="CHOOSE YOUR PACE" title="Plans built around the learning work">You are paying for structure, AI understanding, notes, practice, feedback, and learning capacity—not access to public videos.</PageHeading><PricingCards plans={plans.data.items} currentPlan={billing.plan} authenticated onSelect={(value) => checkout.mutate(value)} pendingPlan={checkout.isPending ? checkout.variables : null} /></section>
  </div>;
}
