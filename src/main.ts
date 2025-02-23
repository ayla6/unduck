import { getBangs } from "./bang" with { type: "macro" };
const bangs = await getBangs();

import "./global.css";

const url = new URL(window.location.href);

type Bang = { u: string; t: string };
const customBangs: Bang[] = JSON.parse(
  localStorage.getItem("custom-bangs") ??
    decodeURI(url.searchParams.get("cb")?.trim() ?? "") ??
    "[]",
);

function noSearchDefaultPageRender() {
  const localization = {
    en: {
      title: "Und*ck",
      description:
        'DuckDuckGo\'s bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo\'s bangs.</a>',
      copy: "Copy",
      defaultBangPlaceholder: "Default bang (ddg)",
      bangAtEnd: "Bang at the end (bang!)",
      customBangs: "Custom bangs",
      applyToUrl: "Apply to URL (for incognito)",
      bangPlaceholder: "Bang (e.g. gh)",
      targetUrlPlaceholder: "Target URL",
      removeButton: "×",
      saveButton: "Save",
      closeButton: "Close",
    },
  };
  // Basic setup
  const ownURL = `${document.location.protocol}//${window.location.host}/`;
  const app = document.querySelector<HTMLDivElement>("#app")!;

  const lang = navigator.language.split("-")[0];
  const localize =
    localization[lang as keyof typeof localization] || localization.en;

  // Render the main HTML template
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>${localize.title}</h1>
        <p>${localize.description}</p>
        <div class="url-container">
          <input
            type="text"
            id="url-input"
            value="${ownURL}?q=%s"
            readonly
          />
          <button id="copy-button">
            <img src="/clipboard.svg" alt="${localize.copy}" />
          </button>
        </div>
        <div class="options-area">
          <input
            type="text"
            id="default-bang-input"
            placeholder="${localize.defaultBangPlaceholder}"
            value="${localStorage.getItem("default-bang") ?? ""}"
          />
          <label>
            <input type="checkbox" id="bang-end-checkbox" checked="${localStorage.getItem("bang-end") ?? true}" />
            <span>${localize.bangAtEnd}</span>
          </label>
        </div>
        <div class="options-area">
          <label>
            <input type="checkbox" id="apply-to-url-checkbox" checked="true" />
            <span>${localize.applyToUrl}</span>
          </label>
          <button id="more-options-button">${localize.customBangs}</button>
        </div>
      </div>
    </div>
    <div id="more-options-popup" class="background">
      <div id="more-options-section" class="popup">
          <div class="section">
            <h3>${localize.customBangs}</h3>
            <div id="custom-bangs-list"></div>
            <div class="bang">
              <input
                type="text"
                id="custom-bang-input"
                placeholder="${localize.bangPlaceholder}"
              />
              <input
                type="text"
                id="custom-bang-url"
                placeholder="${localize.targetUrlPlaceholder}"
              />
              <button style="visibility: hidden;">${localize.removeButton}</button>
            </div>
            <div class="options-area">
              <button id="save-bangs-button">${localize.saveButton}</button>
              <button id="close-options-button">${localize.closeButton}</button>
            </div>
          </div>
        </div>
    </div>
  `;

  // Get DOM elements
  const copyButton = app.querySelector<HTMLButtonElement>("#copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>("#url-input")!;

  const defaultUrlBangInput = app.querySelector<HTMLInputElement>(
    "#default-bang-input",
  )!;

  const bangEndCheckbox =
    app.querySelector<HTMLInputElement>("#bang-end-checkbox")!;

  const moreOptionsButton = app.querySelector<HTMLButtonElement>(
    "#more-options-button",
  )!;
  const moreOptionsPopup = app.querySelector<HTMLDivElement>(
    "#more-options-popup",
  )!;

  const customBangsList =
    app.querySelector<HTMLDivElement>("#custom-bangs-list")!;
  const customBangInput =
    app.querySelector<HTMLInputElement>("#custom-bang-input")!;
  const customBangUrl =
    app.querySelector<HTMLInputElement>("#custom-bang-url")!;
  const saveBangsButton =
    app.querySelector<HTMLButtonElement>("#save-bangs-button")!;

  const closeOptionsButton = app.querySelector<HTMLButtonElement>(
    "#close-options-button",
  )!;

  const applyToUrlCheckbox = app.querySelector<HTMLInputElement>(
    "#apply-to-url-checkbox",
  )!;

  let customBangsArray: Array<{ t: string; u: string }> = customBangs;

  function addCustomBangToList(bang: string, url: string) {
    const newBangElement = document.createElement("div");
    newBangElement.className = "bang";
    const bangInput = document.createElement("input");
    bangInput.type = "text";
    bangInput.value = bang;
    bangInput.className = "custom-bang-input";
    bangInput.placeholder = localize.bangPlaceholder;

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.value = url;
    urlInput.className = "custom-bang-url";
    urlInput.placeholder = localize.targetUrlPlaceholder;

    const deleteButton = document.createElement("button");
    deleteButton.className = "custom-bang-delete";
    deleteButton.textContent = localize.removeButton;

    newBangElement.append(bangInput, urlInput, deleteButton);

    deleteButton.addEventListener("click", () => {
      newBangElement.remove();
    });

    customBangsList.appendChild(newBangElement);

    return {
      bangInput,
      urlInput,
    };
  }

  function loadCustomBangs() {
    if (customBangs) {
      customBangsList.innerHTML = "";
      customBangs.forEach((bang) => {
        addCustomBangToList(bang.t, bang.u);
      });
    }
  }

  loadCustomBangs();

  saveBangsButton.addEventListener("click", () => {
    const inputs = customBangsList.querySelectorAll(".bang");
    customBangsArray = Array.from(inputs).map((bangDiv) => {
      return {
        t: (bangDiv.querySelector(".custom-bang-input") as HTMLInputElement)
          .value,
        u: (
          bangDiv.querySelector(".custom-bang-url") as HTMLInputElement
        ).value.replace("%s", "{{{s}}}"),
      };
    });
    updateUrl();
    localStorage.setItem("custom-bangs", JSON.stringify(customBangsArray));
  });

  const addCustomBang = () => {
    const bang = customBangInput.value.trim();
    const url = customBangUrl.value.trim();

    const { bangInput, urlInput } = addCustomBangToList(bang, url);
    (document.activeElement === customBangInput ? bangInput : urlInput).focus();

    customBangInput.value = "";
    customBangUrl.value = "";
  };

  // Event handlers
  customBangInput.addEventListener("input", addCustomBang);
  customBangUrl.addEventListener("input", addCustomBang);

  moreOptionsButton.addEventListener("click", (e) => {
    e.preventDefault();
    moreOptionsPopup.style.display = "flex";
  });

  closeOptionsButton.addEventListener("click", () => {
    moreOptionsPopup.style.display = "none";
  });

  function updateUrl() {
    const defaultBang = defaultUrlBangInput.value.trim();
    const bangAtEnd = bangEndCheckbox.checked;

    let newUrl = `${ownURL}?q=%s`;
    if (applyToUrlCheckbox.checked) {
      if (defaultBang) {
        newUrl += `&d=${defaultBang}`;
      }
      if (!bangAtEnd) {
        newUrl += "&nobae";
      }
      if (customBangsArray[0]) {
        newUrl += "&cb=" + encodeURI(JSON.stringify(customBangsArray));
      }
    }
    urlInput.value = newUrl;
  }

  defaultUrlBangInput.addEventListener("input", () => {
    if (defaultUrlBangInput.value.trim())
      localStorage.setItem("default-bang", defaultUrlBangInput.value);
    else localStorage.removeItem("default-bang");
    updateUrl();
  });
  bangEndCheckbox.addEventListener("change", updateUrl);
  applyToUrlCheckbox.addEventListener("change", updateUrl);

  updateUrl();

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });
}

function getBangredirectUrl() {
  const query = url.searchParams.get("q")?.trim() ?? "";
  const bangAtEnd = url.searchParams.get("nobae") === null;
  const urlDefault =
    localStorage.getItem("default-bang") ??
    url.searchParams.get("d")?.trim() ??
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
  // https://www.google.com/search?q=%s
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
