import { createClient } from "npm:@supabase/supabase-js@2";

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD")!;

const allowedOrigins = new Set([
  "https://iamajeeth.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
]);

function corsHeaders(origin: string | null) {
  const acceptedOrigin =
    origin && allowedOrigins.has(origin)
      ? origin
      : "https://iamajeeth.github.io";

  return {
    "Access-Control-Allow-Origin": acceptedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(origin: string | null, status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  const body = await request.json();

  if (body.password !== ADMIN_PASSWORD) {
    return json(origin, 401, {
      error: "Invalid password",
    });
  }

  const page = Number(body.page ?? 1);
  const pageSize = Number(body.pageSize ?? 10);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Total participants
  const { count: participantCount } = await supabase
    .from("spins")
    .select("*", {
      head: true,
      count: "exact",
    });

  // Today's participants
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: todayCount } = await supabase
    .from("spins")
    .select("*", {
      head: true,
      count: "exact",
    })
    .gte("claimed_at", today.toISOString());

  // Last spin
  const { data: lastSpinRow } = await supabase
    .from("spins")
    .select("claimed_at")
    .order("claimed_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  // Participants
  const { data: participants } = await supabase
    .from("spins")
    .select("*")
    .order("claimed_at", {
      ascending: false,
    })
    .range(from, to);

  // Prize statistics
  const { data: prizeStats } =
    await supabase.rpc("prize_statistics");

  return json(origin, 200, {
    participantCount,

    todayCount,

    lastSpin: lastSpinRow?.claimed_at ?? null,

    page,

    pageSize,

    totalPages: Math.ceil((participantCount ?? 0) / pageSize),

    participants,

    prizeStats,
  });
});