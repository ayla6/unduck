import crypto from "crypto";

async function generateBangsChecksum() {
  try {
    const BANGS_VERSION = "dbe96505d1ea29e83d29d3255927d45d9b565490";
    const response = await fetch(
      `https://github.com/kagisearch/bangs/raw/${BANGS_VERSION}/data/bangs.json`,
    );
    const buffer = await response.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    console.log("Checksum for bangs.json:");
    console.log(hashHex);
  } catch (error) {
    console.error("Error generating checksum:", error);
  }
}
generateBangsChecksum();
