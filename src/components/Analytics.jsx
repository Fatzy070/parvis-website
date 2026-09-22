import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.PROD) {
      const page_path = location.pathname + location.search;
      if (typeof window.gtag === "function") {
        window.gtag("event", "page_view", {
          page_path,
        });
      }
    }
  }, [location.pathname, location.search]);

  if (!import.meta.env.PROD) return null;

  return (
    <>
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-N1Q8RNFNXP"
      ></script>
      <script id="ga-init">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-N1Q8RNFNXP', { send_page_view: false });
        `}
      </script>
    </>
  );
}
