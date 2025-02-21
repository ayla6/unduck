// got a lot from here https://github.com/searxng/searxng/blob/master/searx/autocomplete.py
export function suggestionOptions() {
  const suggestionOptions = [
    {
      name: "DuckDuckGo",
      url: `https://duckduckgo.com/ac/?type=list&kl=$%l&q=%s`,
    },
    {
      name: "DuckDuckGo (English)",
      url: `https://duckduckgo.com/ac/?type=list&q=%s`,
    },
    {
      name: "Brave",
      url: `https://search.brave.com/api/suggest?q=%s`,
    },
    {
      name: "SearXNG (priv.au)",
      url: `https://priv.au/suggester?q=%s`,
    },
    {
      name: "Qwant",
      url: `https://api.qwant.com/v3/suggest?q=%s&locale=%l`,
    },
    {
      name: "Wikipedia",
      url: `https://%l.wikipedia.org/w/api.php?action=opensearch&formatversion=2&format=json&search=%s&namespace=0&limit=10`,
    },
    {
      name: "Wikipedia (English)",
      url: `https://en.wikipedia.org/w/api.php?action=opensearch&formatversion=2&format=json&search=%s&namespace=0&limit=10`,
    },
    {
      name: "Yandex",
      url: `https://suggest.yandex.com/suggest-ff.cgi?part=%s`,
    },
    {
      name: "Google",
      url: `https://www.google.com/?q=%s&client=gws-wiz`,
    },
  ] as const;

  return suggestionOptions
    .map((option) => `<option value="${option.url}">${option.name}</option>`)
    .join("");
}
