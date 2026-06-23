import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import App from "@/app/App";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TooltipProvider>
      <App />
      <Toaster richColors position="top-center" />
    </TooltipProvider>
  </StrictMode>
);
