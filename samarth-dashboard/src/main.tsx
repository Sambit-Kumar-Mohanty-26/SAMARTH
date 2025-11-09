import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Leaflet CSS (required for map styling)
import "leaflet/dist/leaflet.css";

// Vite + Leaflet fix (side-effect file)
import "./leafletFix";

// App styles (Tailwind + custom)
import "./index.css";

// App entry
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
