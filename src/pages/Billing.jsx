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
  return <div className="billing-page"><section className="billing-current"><div><p className="eyebrow">CURRENT PLAN</p><div className="billing-title"><h2>{plan.name}</h2><PlanBadge plan={billing.plan} name={plan.name} /></div><p>{price}{billing.plan !== "free" && "/month"}</p><p className="muted">Status: {billing.status.replaceAll("_", " ")}{billing.nextPaymentDate ? ` · Next payment ${new Date(billing.nextPaymentDate).toLocaleDateString()}` : ""}</p>{billing.cancelAtPeriodEnd && <p className="notice">Renewal is cancelled. Paid access remains available through {new Date(billing.currentPeriodEnd).toLocaleDateString()}.</p>}</div>{billing.plan !== "free" && <div className="billing-actions"><button className="button secondary" onClick={() => manage.mutate()} disabled={manage.isPending}>Manage payment method</button>{!billing.cancelAtPeriodEnd && (confirmCancel ? <div className="cancel-confirm"><p>Cancel future renewal? Your current paid period will remain available.</p><button className="button danger" onClick={() => cancel.mutate()} disabled={cancel.isPending}>Confirm cancellation</button><button className="text-link" onClick={() => setConfirmCancel(false)}>Keep plan</button></div> : <button className="text-link" onClick={() => setConfirmCancel(true)}>Cancel renewal</button>)}</div>}</section><FormError error={checkout.error || cancel.error || manage.error} />
    <section><h2>Your usage</h2><div className="usage-grid"><UsageMeter label="Active courses" {...billing.activeCourses} />{Object.entries(billing.usage).map(([key, value]) => <UsageMeter key={key} label={labels[key] || key} {...value} />)}</div><p className="field-hint">Provider-backed AI actions count during your current usage period. Cached results do not reduce your allowance.</p></section>
    <section><PageHeading eyebrow="CHOOSE YOUR PACE" title="Plans built around the learning work">You are paying for structure, AI understanding, notes, practice, feedback, and learning capacity—not access to public videos.</PageHeading><PricingCards plans={plans.data.items} currentPlan={billing.plan} authenticated onSelect={(value) => checkout.mutate(value)} pendingPlan={checkout.isPending ? checkout.variables : null} /></section>
  </div>;
}
