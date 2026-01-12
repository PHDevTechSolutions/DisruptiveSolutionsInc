// lib/detect-website.ts
export function detectWebsite(pathname: string) {
  if (pathname.includes("ecoshift")) return "ecoshift";
  if (pathname.includes("disruptive")) return "disruptive";
  if (pathname.includes("vah")) return "vah";
  return "unknown";
}
