const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

const missing = required.filter((name) => !process.env[name]);
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const failures = [];

if (missing.length) {
  failures.push(`Missing environment variables: ${missing.join(", ")}`);
}
if (siteUrl && !siteUrl.startsWith("https://")) {
  failures.push("NEXT_PUBLIC_SITE_URL must use HTTPS.");
}
if (supabaseUrl && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl)) {
  failures.push("NEXT_PUBLIC_SUPABASE_URL must be an HTTPS Supabase project URL.");
}
if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== "false") {
  failures.push("NEXT_PUBLIC_ENABLE_DEMO_MODE must be explicitly set to false for production.");
}
if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY === "******") {
  failures.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY still contains the placeholder value.");
}

if (failures.length) {
  console.error("Production configuration check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Production configuration check passed.");
