export const GOOGLE_TRANSLATE_LANGUAGE_KEY = "med_language";

export const getSavedGoogleLanguage = () => {
  return localStorage.getItem(GOOGLE_TRANSLATE_LANGUAGE_KEY) || "en";
};

const setCookie = (name, value) => {
  document.cookie = `${name}=${value};path=/`;

  if (window.location.hostname.includes(".")) {
    document.cookie = `${name}=${value};path=/;domain=${window.location.hostname}`;
  }
};

const setTranslateCookie = (language) => {
  const value = language === "hi" ? "/en/hi" : "/en/en";

  setCookie("googtrans", value);
};

export const changeGoogleLanguage = (language) => {
  localStorage.setItem(GOOGLE_TRANSLATE_LANGUAGE_KEY, language);
  setTranslateCookie(language);

  const combo = document.querySelector(".goog-te-combo");

  if (combo) {
    combo.value = language;
    combo.dispatchEvent(new Event("change"));
    return;
  }

  window.location.reload();
};
