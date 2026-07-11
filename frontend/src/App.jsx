import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import GoogleTranslateWidget from "./components/common/GoogleTranslateWidget";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView();
      });
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname, search, hash]);

  return (
    <>
      <GoogleTranslateWidget />
      <AppRoutes />
    </>
  );
}

export default App;
