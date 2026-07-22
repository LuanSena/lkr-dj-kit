import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Layout, type View } from "@/components/Layout";
import { Home } from "@/components/Home";
import { Downloader } from "@/components/Downloader";
import { Converter } from "@/components/Converter";
import { Library } from "@/components/Library";
import { Settings } from "@/components/Settings";
import type { Locale } from "@/i18n";
import { installBrowserMockIfNeeded } from "@/lib/desktop-mock";
import "./index.css";

installBrowserMockIfNeeded();

function App() {
  const [view, setView] = useState<View>("home");
  const [locale, setLocale] = useState<Locale>("pt");

  return (
    <Layout locale={locale} setLocale={setLocale} view={view} setView={setView}>
      {view === "home" && <Home locale={locale} setView={setView} />}
      {view === "downloader" && <Downloader locale={locale} setView={setView} />}
      {view === "converter" && <Converter locale={locale} />}
      {view === "library" && <Library locale={locale} />}
      {view === "settings" && <Settings locale={locale} />}
    </Layout>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
