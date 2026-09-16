import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { ErrorState, PageSkeleton } from "./UI";
export default function ResetAuthorization() {
  const location = useLocation();
  const [expired, setExpired] = useState(false);
  const authorization = useQuery({
    queryKey: ["reset-authorization"],
    queryFn: ({ signal }) => api("/auth/reset-authorization", { signal }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
  const expiresAt = authorization.data?.expiresAt;
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setTimeout(
      () => setExpired(true),
      Math.max(0, new Date(expiresAt).getTime() - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [expiresAt]);
  // Never render from a cached authorization while the server check is pending.
  if (authorization.isPending || authorization.isFetching)
    return <PageSkeleton />;
  if (authorization.isError)
    return (
      <div className="container section">
        <ErrorState error={authorization.error} retry={authorization.refetch} />
      </div>
    );
  if (!authorization.data?.authorized || expired)
    return (
      <Navigate
        to="/forgot-password"
        replace
        state={{
          email: location.state?.email,
          notice: "Verify a new reset code before choosing your password.",
        }}
      />
    );
  return <Outlet />;
}
