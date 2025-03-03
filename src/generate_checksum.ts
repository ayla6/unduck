import crypto from "crypto";

async function generateBangsChecksum() {
  try {
    const BANGS_VERSION = "7c64a3e5318a4648096f468d6827fef7d0f97dab";
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
