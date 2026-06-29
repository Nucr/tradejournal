import { Creem } from "creem";

function getServer() {
  if (process.env.NEXT_PUBLIC_CREEM_TEST_MODE === "true") return "test" as const;
  return "prod" as const;
}

export const creem = new Creem({
  apiKey: process.env.CREEM_API_KEY ?? "",
  server: getServer(),
});
