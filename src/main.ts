import { getBangs } from "./bang" with { type: "macro" };
import { suggestionOptions } from "./suggestion" with { type: "macro" };
const bangs = await getBangs();

import search from "../public/search.svg";
import "./global.css";

type Bang = { u: string; t: string };
const customBangs: Bang[] = JSON.parse(
  localStorage.getItem("custom-bangs") || "[]",
);

function noSearchDefaultPageRender() {
  const currentLocale = (
    navigator.language || navigator.languages[0]
  ).substring(0, 2);

  const updateOpenSearch = (template: string, suggestions: string) => {
    const opensearch = `<?xml version="1.0" encoding="UTF-8"?>
  <OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
    <ShortName>Unduck</ShortName>
    <Description>A better default search engine (with bangs!)</Description>
    <InputEncoding>UTF-8</InputEncoding>
    <Image width="16" height="16" type="image/svg+xml">${search}</Image>
    <Url type="text/html" method="get" template="${template.replace("%s", "{searchTerms}")}"/>
    <Url type="application/x-suggestions+json" template="${suggestions.replace("%s", "{searchTerms}")}"/>
    <moz:SearchForm>${ownURL}</moz:SearchForm>
  </OpenSearchDescription>`;

    const link = document.getElementById("opensearch") as HTMLLinkElement;
    link.href = `data:application/opensearchdescription+xml;base64,${btoa(
      opensearch,
    )}`;
  };

  // Basic setup
  const ownURL = `${document.location.protocol}//${window.location.host}/`;
  const app = document.querySelector<HTMLDivElement>("#app")!;

  // Render the main HTML template
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Und*ck</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
        <div class="url-container">
          <input
            type="text"
            id="url-input"
            value="${ownURL}?q=%s"
            readonly
          />
          <button id="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
        <div class="options-area">
          <button id="default-url-bang-button">Enable custom default bang</button>
          <div id="default-url-bang-section" style="display: none;">
            <input
              type="text"
              id="default-url-bang-input"
              placeholder="ddg (default)"
            />
          </div>
          <label class="bang-end-label">
            <input type="checkbox" id="bang-end-checkbox" checked=true />
            <span>Bang at the end (bang!)</span>
          </label>
        </div>
        <div class="section">
          <h3>Suggestions API</h3>
          <div class="type-or-select">
            <select id="suggestions-api-select">
              <option value="">Select or enter a custom URL</option>
              ${suggestionOptions().replace("%l", currentLocale)}
            </select>
            <input type="text" id="suggestions-api-custom" placeholder="Custom URL" style="display: none;">
            <input type="text" id="suggestions-api-display" placeholder="Selected Suggestion API" readonly style="display: none;">
          </div>
        </div>
        <button id="more-options-button">More Options</button>
      </div>
    </div>
    <div id="more-options-popup" class="background">
      <div id="more-options-section" class="popup">
          <div class="section">
            <h3>Default Bang</h3>
            <div class="empty"></div>
            <div class="bang">
              <input
                type="text"
                id="default-bang-input"
                placeholder="Bang (e.g. gh)"
                value="${localStorage.getItem("default-bang") ?? "ddg"}"
              />
              <button id="default-bang-save">Save</button>
            </div>
          </div>
          <div class="section">
            <h3>Custom Bangs</h3>
            <div id="custom-bangs-list"></div>
            <div class="bang">
              <input
                type="text"
                id="custom-bang-input"
                placeholder="Bang (e.g. gh)"
              />
              <input
                type="text"
                id="custom-bang-url"
                placeholder="Target URL with %s"
              />
              <button id="custom-bang-add">Add</button>
            </div>
            <button id="save-bangs-button">Save</button>
          </div>
          <button id="close-options-button">Close</button>
        </div>
    </div>
  `;

  // Get DOM elements
  const copyButton = app.querySelector<HTMLButtonElement>("#copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>("#url-input")!;

  const defaultUrlBangButton = app.querySelector<HTMLButtonElement>(
    "#default-url-bang-button",
  )!;
  const defaultUrlBangSection = app.querySelector<HTMLDivElement>(
    "#default-url-bang-section",
  )!;
  const defaultUrlBangInput =
    defaultUrlBangSection.querySelector<HTMLInputElement>(
      "#default-url-bang-input",
    )!;

  const bangEndCheckbox =
    app.querySelector<HTMLInputElement>("#bang-end-checkbox")!;

  const moreOptionsButton = app.querySelector<HTMLButtonElement>(
    "#more-options-button",
  )!;
  const moreOptionsPopup = app.querySelector<HTMLDivElement>(
    "#more-options-popup",
  )!;

  const moreOptionsSection = app.querySelector<HTMLDivElement>(
    "#more-options-section",
  )!;

  const defaultBangInput = moreOptionsSection.querySelector<HTMLInputElement>(
    "#default-bang-input",
  )!;
  const defaultBangSave =
    moreOptionsSection.querySelector<HTMLInputElement>("#default-bang-save")!;

  const customBangsList =
    app.querySelector<HTMLDivElement>("#custom-bangs-list")!;
  const customBangInput =
    app.querySelector<HTMLInputElement>("#custom-bang-input")!;
  const customBangUrl =
    app.querySelector<HTMLInputElement>("#custom-bang-url")!;
  const customBangAdd =
    app.querySelector<HTMLButtonElement>("#custom-bang-add")!;
  const saveBangsButton =
    app.querySelector<HTMLButtonElement>("#save-bangs-button")!;

  const closeOptionsButton = app.querySelector<HTMLButtonElement>(
    "#close-options-button",
  )!;
  const suggestionsApiSelect = app.querySelector<HTMLSelectElement>(
    "#suggestions-api-select",
  )!;
  const suggestionsApiCustom = app.querySelector<HTMLInputElement>(
    "#suggestions-api-custom",
  )!;
  const suggestionsApiDisplay = app.querySelector<HTMLInputElement>(
    "#suggestions-api-display",
  )!;

  let customBangsArray: Array<{ t: string; u: string }> = [];

  function addCustomBangToList(bang: string, url: string) {
    const newBangElement = document.createElement("div");
    newBangElement.className = "bang";
    newBangElement.innerHTML = `
      <input type="text" value="${bang}" class="custom-bang-input" />
      <input type="text" value="${url}" class="custom-bang-url" />
      <button class="custom-bang-delete">Rm</button>
    `;

    newBangElement
      .querySelector(".custom-bang-delete")
      ?.addEventListener("click", () => {
        newBangElement.remove();
      });

    customBangsList.appendChild(newBangElement);
  }

  function loadCustomBangs() {
    if (customBangs) {
      customBangsList.innerHTML = "";
      customBangs.forEach((bang) => {
        addCustomBangToList(bang.t, bang.u.replace("{{{s}}}", "%s"));
      });
    }
  }

  loadCustomBangs();

  saveBangsButton.addEventListener("click", () => {
    const inputs = customBangsList.querySelectorAll(".custom-bang");
    customBangsArray = Array.from(inputs).map((bangDiv) => ({
      t: (bangDiv.querySelector(".custom-bang-input") as HTMLInputElement)
        .value,
      u: (
        bangDiv.querySelector(".custom-bang-url") as HTMLInputElement
      ).value.replace("%s", "{{{s}}}"),
    }));
    localStorage.setItem("custom-bangs", JSON.stringify(customBangsArray));
  });

  // Event handlers
  customBangAdd.addEventListener("click", () => {
    const bang = customBangInput.value.trim();
    const url = customBangUrl.value.trim();

    try {
      new URL(url);
      if (!url.includes("%s")) {
        alert("URL must contain %s as a placeholder");
        return;
      }

      // Check if bang already exists
      const existingCustomBangs = Array.from(
        customBangsList.querySelectorAll(".custom-bang-input"),
      ).map((input) => (input as HTMLInputElement).value);
      if (existingCustomBangs.includes(bang)) {
        alert("This bang already exists");
        return;
      }

      if (bang && url) {
        addCustomBangToList(bang, url);
        customBangInput.value = "";
        customBangUrl.value = "";
      }
    } catch (e) {
      alert("Please enter a valid URL");
      return;
    }
  });

  defaultUrlBangButton.addEventListener("click", (e) => {
    e.preventDefault();
    defaultUrlBangSection.style.display = "block";
    defaultUrlBangButton.style.display = "none";
  });

  moreOptionsButton.addEventListener("click", (e) => {
    e.preventDefault();
    moreOptionsPopup.style.display = "flex";
  });

  closeOptionsButton.addEventListener("click", () => {
    moreOptionsPopup.style.display = "none";
  });

  defaultBangSave.addEventListener("click", (e) => {
    e.preventDefault();
    const defaultBang = defaultBangInput.value.trim();
    localStorage.setItem("default-bang", defaultBang);
  });

  function updateUrl() {
    const defaultBang = defaultUrlBangInput.value.trim();
    const bangAtEnd = bangEndCheckbox.checked;
    const suggestionsUrl =
      suggestionsApiSelect.value || suggestionsApiCustom.value;

    let newUrl = `${ownURL}?q=%s`;
    if (defaultBang) {
      newUrl += `&default=${defaultBang}`;
    }
    if (!bangAtEnd) {
      newUrl += "&nobae";
    }
    urlInput.value = newUrl;
    updateOpenSearch(newUrl, suggestionsUrl);
  }

  defaultUrlBangInput.addEventListener("input", updateUrl);
  bangEndCheckbox.addEventListener("change", updateUrl);
  suggestionsApiSelect.addEventListener("change", updateUrl);
  suggestionsApiCustom.addEventListener("input", updateUrl);

  updateUrl();

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });

  const suggestionApiSelectionUpdate = () => {
    const isCustom = suggestionsApiSelect.value === "";
    suggestionsApiCustom.style.display = isCustom ? "block" : "none";
    suggestionsApiDisplay.style.display = !isCustom ? "block" : "none";
    suggestionsApiDisplay.value = isCustom ? "" : suggestionsApiSelect.value;
  };

  suggestionsApiSelect.addEventListener("change", suggestionApiSelectionUpdate);

  suggestionApiSelectionUpdate();
}

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const bangAtEnd = url.searchParams.get("nobae") === null;
  const urlDefault =
    url.searchParams.get("default")?.trim() ??
    localStorage.getItem("default-bang") ??
    "ddg";

  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(bangAtEnd ? /!(\S+)|(\S+)!/i : /!(\S+)/i);

  const multiSearch = (candidate: string) =>
    customBangs.find((b) => b.t === candidate) ??
    bangs.find((b) => b.t === candidate);

  const bangCandidate = (match?.[1] ?? match?.[2])?.toLowerCase() ?? urlDefault;
  const selectedBang = multiSearch(bangCandidate) ?? multiSearch(urlDefault);

  // Remove the first bang from the query
  const cleanQuery = query
    .replace(bangAtEnd ? /(!\S+)|(\S+!)\s*/i : /!\S+\s*/i, "")
    .trim();

  // If the query is just `!gh`, use `github.com` instead of `github.com/search?q=`
  if (cleanQuery === "")
    return selectedBang ? `https://${new URL(selectedBang.u).host}` : null;

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function doRedirect() {
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();
