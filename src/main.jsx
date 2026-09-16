import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { queryClient } from "./queries";
import App from "./App";
import "./index.css";
const content = (
  <QueryClientProvider client={queryClient}>
    <App />
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
