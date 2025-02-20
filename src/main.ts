import { bangs } from "./bang";
import "./global.css";

type BangItem = { u: string; t: string };
const customBangs: BangItem[] = JSON.parse(
  localStorage.getItem("custom-bangs") || "[]",
);

function noSearchDefaultPageRender() {
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
            class="url-input"
            value="${ownURL}?q=%s"
            readonly
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
        <div class="options-area">
          <button class="default-bang-button">Enable custom default bang</button>
          <div class="default-bang-section" style="display: none;">
            <input
              type="text"
              class="default-bang-input"
              placeholder="ddg (default)"
            />
          </div>
          <label class="bang-end-label">
            <input type="checkbox" class="bang-end-checkbox" checked=true />
            <span>Bang at the end (bang!)</span>
          </label>
        </div>
        <div class="custom-bang-section">
          <h3>Custom Bangs</h3>
          <div id="custom-bangs-list"></div>
          <div class="custom-bang">
            <input
              type="text"
              class="custom-bang-input"
              placeholder="Bang (e.g. gh)"
            />
            <input
              type="text"
              class="custom-bang-url"
              placeholder="Target URL with %s"
            />
            <button class="custom-bang-add">Add</button>
          </div>
          <button class="save-bangs-button">Save</button>
        </div>
      </div>
    </div>
  `;

  // Get DOM elements
  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;
  const defaultBangButton = app.querySelector<HTMLButtonElement>(
    ".default-bang-button",
  )!;
  const defaultBangSection = app.querySelector<HTMLDivElement>(
    ".default-bang-section",
  )!;
  const defaultBangInput = defaultBangSection.querySelector<HTMLInputElement>(
    ".default-bang-input",
  )!;
  const bangEndCheckbox =
    app.querySelector<HTMLInputElement>(".bang-end-checkbox")!;
  const customBangsList =
    app.querySelector<HTMLDivElement>("#custom-bangs-list")!;
  const customBangInput =
    app.querySelector<HTMLInputElement>(".custom-bang-input")!;
  const customBangUrl =
    app.querySelector<HTMLInputElement>(".custom-bang-url")!;
  const customBangAdd =
    app.querySelector<HTMLButtonElement>(".custom-bang-add")!;
  const saveBangsButton =
    app.querySelector<HTMLButtonElement>(".save-bangs-button")!;
  const originalUrl = urlInput.value;

  let customBangsArray: Array<{ t: string; u: string }> = [];

  function addCustomBangToList(bang: string, url: string) {
    const newBangElement = document.createElement("div");
    newBangElement.className = "custom-bang";
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

  defaultBangButton.addEventListener("click", (e) => {
    e.preventDefault();
    defaultBangSection.style.display = "block";
    defaultBangButton.style.display = "none";
  });

  function updateUrl() {
    const defaultBang = defaultBangInput.value.trim();
    const bangAtEnd = bangEndCheckbox.checked;

    if (defaultBang === "" && bangAtEnd) {
      urlInput.value = originalUrl;
    } else {
      let newUrl = `${ownURL}?q=%s`;
      if (defaultBang) {
        newUrl += `&default=${defaultBang}`;
      }
      if (!bangAtEnd) {
        newUrl += "&nobae";
      }
      urlInput.value = newUrl;
    }
  }

  defaultBangInput.addEventListener("input", updateUrl);
  bangEndCheckbox.addEventListener("change", updateUrl);

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
