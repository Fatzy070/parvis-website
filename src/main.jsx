import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { queryClient } from "./queries";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
const content = (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        {content}
      </GoogleOAuthProvider>
    ) : (
      content
    )}
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("ServiceWorker registration failed:", err);
    });
  });
}
