import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-services";

const loadGoogleScript = () => {
  if (document.getElementById(GOOGLE_SCRIPT_ID)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const GoogleAuthButton = ({ onCredential, text = "continue_with" }) => {
  const buttonRef = useRef(null);
  const [available, setAvailable] = useState(Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID));

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setAvailable(false);
      return undefined;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text,
          width: buttonRef.current.offsetWidth || 320,
        });
      })
      .catch(() => setAvailable(false));

    return () => {
      cancelled = true;
    };
  }, [onCredential, text]);

  if (!available) return null;

  return <div ref={buttonRef} className="flex min-h-[44px] w-full justify-center" />;
};

export default GoogleAuthButton;
