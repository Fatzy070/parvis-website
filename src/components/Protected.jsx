import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../queries";
import { ErrorState, PageSkeleton } from "./UI";
export default function Protected() {
  const session = useSession();
  const location = useLocation();
  if (session.isPending) return <PageSkeleton />;
  if (session.error?.code === "VERIFICATION_REQUIRED")
    return (
      <Navigate
        to="/verify-email"
        state={{
          email: session.error.email,
          from: location.pathname + location.search,
        }}
        replace
      />
    );
  if (session.isError)
    return (
      <div className="container section">
        <ErrorState error={session.error} retry={session.refetch} />
      </div>
    );
  if (!session.data)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  return <Outlet />;
}
