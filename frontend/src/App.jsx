import "./App.css";
import GoogleTranslateWidget from "./components/common/GoogleTranslateWidget";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <GoogleTranslateWidget />
      <AppRoutes />
    </>
  );
}

export default App;
