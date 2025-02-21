// based on this fork https://github.com/Not-Jayden/unduck

type FullBang = {
  c?: string;
  d: string;
  r: number;
  s: string;
  sc?: string;
  t: string;
  u: string;
};

type Bang = {
  t: string;
  u: string;
};

if (typeof window !== "undefined") {
  throw new Error(
    "Attempted to re-map bangs on client side instead of at build time",
  );
}

export async function getBangs(): Promise<Bang[]> {
  return [
    {
      t: "t3",
      u: "https://www.t3.chat/new?q={{{s}}}",
    },
    ...(
      (await fetch("https://duckduckgo.com/bang.js").then((r) =>
        r.json(),
      )) as FullBang[]
    ).map((fullBang) => ({ t: fullBang.t, u: fullBang.u })),
  ];
}
