import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { bootstrapNative } from "./services/nativeBootstrap";

// Initialize native services before render (no-ops on web)
bootstrapNative();

createRoot(document.getElementById("root")!).render(<App />);
