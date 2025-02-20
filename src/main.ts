import { bangs } from "./bang";
import "./global.css";

function noSearchDefaultPageRender() {
  const ownURL = `${document.location.protocol}//${window.location.host}/`;
  const app = document.querySelector<HTMLDivElement>("#app")!;
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
      </div>
    </div>
  `;

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
  const originalUrl = urlInput.value;

  defaultBangButton.addEventListener("click", (e) => {
    e.preventDefault();
    defaultBangSection.style.display = "block";
    defaultBangButton.style.display = "none";
  });

  const updateUrl = () => {
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
  };

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

  const bangCandidate = (match?.[1] ?? match?.[2])?.toLowerCase() ?? urlDefault;
  const selectedBang =
    bangs.find((b) => b.t === bangCandidate) ??
    bangs.find((b) => b.t === urlDefault);

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
