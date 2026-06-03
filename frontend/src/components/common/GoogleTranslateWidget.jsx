import { useEffect } from "react";
import { getSavedGoogleLanguage } from "../../utils/googleTranslate";

const GoogleTranslateWidget = () => {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi",
          autoDisplay: false,
        },
        "google_translate_element",
      );

      if (getSavedGoogleLanguage() === "hi") {
        setTimeout(() => {
          const combo = document.querySelector(".goog-te-combo");

          if (combo) {
            combo.value = "hi";
            combo.dispatchEvent(new Event("change"));
          }
        }, 800);
      }
    };

    if (!document.querySelector("#google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return <div id="google_translate_element" className="hidden" />;
};

export default GoogleTranslateWidget;
