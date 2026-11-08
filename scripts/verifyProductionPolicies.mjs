import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before running this check.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tables = ["branches", "profiles", "batches", "students", "attendance", "payments", "fee_adjustments"];
const results = await Promise.all(
  tables.map(async (table) => {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    return { table, count, error };
  }),
);

const unexpected = results.filter(({ error, count }) =>
  (error && !/JWT|permission|authentication/i.test(error.message)) || count > 0,
);
if (unexpected.length) {
  console.error("Production database connectivity check failed:");
  unexpected.forEach(({ table, error, count }) => {
    console.error(`- ${table}: ${error ? error.message : `anonymous count was ${count}`}`);
  });
  process.exit(1);
}

console.log("Anon-key database access checks completed.");
console.log("Expected result: unauthenticated requests are denied or return no rows.");
console.log("Verify authenticated admin/teacher policy behavior with the SQL checklist in supabase/verify-production.sql.");
