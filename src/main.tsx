import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";

/**
 * Root mounting point
 * - Keep strict mode for dev safety
 * - Ready for future providers (router, store, etc)
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element (#root) not found in index.html");
}

const root = createRoot(rootElement);

<script src="/script.js" defer></script>

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);