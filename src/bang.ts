// based on this fork https://github.com/Not-Jayden/unduck
import crypto from "crypto";

type FullBang = {
  c?: string;
  d: string;
  r: number;
  s: string;
  sc?: string;
  t: string;
  u: string;
};

type Bang = [t: string, u: string];

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

const BANGS_VERSION = "dbe96505d1ea29e83d29d3255927d45d9b565490";
const EXPECTED_CHECKSUM =
  "d338345f84bd46d9825e3da495f7cb6f7205d419dc015b173a6f4b9461cbfa7c";

export async function getBangs(): Promise<Bang[]> {
  const response = await fetch(
    `https://github.com/kagisearch/bangs/raw/${BANGS_VERSION}/data/bangs.json`,
  );
  const buffer = await response.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hashHex !== EXPECTED_CHECKSUM) {
    throw new Error("Bangs file checksum mismatch");
  }

  return [
    ["t3", "https://www.t3.chat/new?q={{{s}}}"],
    ...(JSON.parse(new TextDecoder().decode(buffer)) as FullBang[]).map(
      (fullBang) =>
        [
          fullBang.t as string,
          fullBang.u.replace(/searx\.me/g, searx) as string,
        ] as Bang,
    ),
  ];
}
