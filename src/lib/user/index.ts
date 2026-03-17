"use server";

import { createAuthClient, createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const getUser = async () => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log(session);

  return session?.user ?? null;
};

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("sb-fspvblfdkguxdualxcwi-auth-token")?.value ?? null;
}

/** Returns the current session’s JWT access_token for Bearer auth (e.g. server-side API calls). */
export async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function validateToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const [type, token] = auth.split(" ");

  if (type !== "Bearer" || !token) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Missing bearer token" },
        { status: 401 },
      ),
    };
  }

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Invalid token", message: error?.message },
        { status: 401 },
      ),
    };
  }

  return { user: data.user, response: null };
}

/** Use in API route handlers: supports both Bearer token (validateToken) and cookie session (getUser). */
export async function getAuthFromRequest(req: Request) {
  const auth = req.headers.get("authorization") || "";

  if (auth.startsWith("Bearer ")) {
    return validateToken(req);
  }
  const user = await getUser();
  return { user, response: null as NextResponse | null };
}
