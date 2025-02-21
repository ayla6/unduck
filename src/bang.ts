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

const instanceDataUrl = "https://searx.space/data/instances.json";

interface InstanceData {
  instances: {
    [url: string]: {
      timing?: {
        initial?: {
          success_percentage?: number;
          all?: {
            value?: number;
          };
        };
        search?: {
          success_percentage?: number;
          all?: {
            median?: number;
            stdev?: number;
            mean?: number;
          };
        };
      };
      html?: {
        grade?: string;
      };
    };
  };
}

export async function getHighestRatedInstance(): Promise<string | null> {
  try {
    const response = await fetch(instanceDataUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch instance data: ${response.status} ${response.statusText}`,
      );
    }

    const data: InstanceData = (await response.json()) as InstanceData;
    let fastestInstanceUrl: string | null = null;
    let fastestResponseTime: number | null = null;

    if (data.instances) {
      for (const url in data.instances) {
        const instance = data.instances[url];
        const searchTiming = instance.timing?.search?.all?.median;

        if (
          typeof searchTiming === "number" &&
          (fastestResponseTime === null || searchTiming < fastestResponseTime)
        ) {
          fastestResponseTime = searchTiming;
          fastestInstanceUrl = url;
        }
      }
    }

    if (fastestInstanceUrl) {
      return fastestInstanceUrl;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting highest rated instance:", error);
    return null;
  }
}

const searx =
  new URL((await getHighestRatedInstance()) as string).host ?? "priv.au";

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
    ).map((fullBang) => ({
      t: fullBang.t,
      u: fullBang.u.replace(/searx\.me/g, searx),
    })),
  ];
}
