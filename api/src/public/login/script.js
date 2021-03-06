let selectedLocale;
let translations;

const setState = function(className) {
  document.getElementById('form').className = className;
};

const post = function(url, payload, callback) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === XMLHttpRequest.DONE) {
      callback(xmlhttp);
    }
  };
  xmlhttp.open('POST', url, true);
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.send(payload);
};

const handleResponse = function(xmlhttp) {
  if (xmlhttp.status === 302) {
    window.location = xmlhttp.response;
  } else if (xmlhttp.status === 401) {
    setState('loginincorrect');
  } else {
    setState('loginerror');
    console.error('Error logging in', xmlhttp.response);
  }
};

const submit = function(e) {
  e.preventDefault();
  if (document.getElementById('form').className === 'loading') {
    // debounce double clicks
    return;
  }
  setState('loading');
  const url = document.getElementById('form').action;
  const payload = JSON.stringify({
    user: document.getElementById('user').value.toLowerCase().trim(),
    password: document.getElementById('password').value,
    locale: selectedLocale
  });
  post(url, payload, handleResponse);
};

const focusOnPassword = function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    document.getElementById('password').focus();
  }
};

const focusOnSubmit = function(e) {
  if (e.keyCode === 13) {
    document.getElementById('login').focus();
  }
};

const highlightSelectedLocale = function() {
  const locales = document.getElementsByClassName('locale');
  for (let i = 0; i < locales.length; i++) {
    const elem = locales[i];
    elem.className = (elem.name === selectedLocale) ? 'locale selected' : 'locale';
  }
};

const handleLocaleSelection = function(e) {
  if (e.target.tagName.toLowerCase() === 'a') {
    e.preventDefault();
    selectedLocale = e.target.name;
    translate();
  }
};

const getLocaleCookie = function() {
  const cookies = document.cookie && document.cookie.split(';');
  if (cookies) {
    for (const cookie of cookies) {
      const parts = cookie.trim().split('=');
      if (parts[0] === 'locale') {
        return parts[1].trim();
      }
    }
  }
};

const getLocale = function() {
  const selectedLocale = getLocaleCookie();
  const defaultLocale = document.body.getAttribute('data-default-locale');
  const locale = selectedLocale || defaultLocale;
  if (translations[locale]) {
    return locale;
  }
  const validLocales = Object.keys(translations);
  if (validLocales.length) {
    return validLocales[0];
  }
  return;
};

const translate = function() {
  if (!selectedLocale) {
    return console.error('No enabled locales found - not translating');
  }
  highlightSelectedLocale();
  document.querySelectorAll('[translate]').forEach(function(elem) {
    const key = elem.getAttribute('translate');
    elem.innerText = translations[selectedLocale][key];
  });
};

const parseTranslations = function() {
  const raw = document.body.getAttribute('data-translations');
  return JSON.parse(decodeURIComponent(raw));
};

document.addEventListener('DOMContentLoaded', function() {
  translations = parseTranslations();
  selectedLocale = getLocale();

  translate();

  document.getElementById('login').addEventListener('click', submit, false);

  const user = document.getElementById('user');
  user.addEventListener('keydown', focusOnPassword, false);
  user.focus();

  document.getElementById('password').addEventListener('keydown', focusOnSubmit, false);
  
  document.getElementById('locale').addEventListener('click', handleLocaleSelection, false);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
});
