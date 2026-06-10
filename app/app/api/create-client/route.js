import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 18);
}

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Variabili Supabase mancanti lato server." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization") || "";
    const token = authorization.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token mancante. Effettua il login." },
        { status: 401 }
      );
    }

    const userSupabase = createClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { user },
      error: userError
    } = await userSupabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Utente non autorizzato." },
        { status: 401 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "professional") {
      return NextResponse.json(
        { error: "Solo il professionista può creare clienti." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const firstName = String(body.first_name || "").trim();
    const lastName = String(body.last_name || "").trim();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Nome e cognome sono obbligatori." },
        { status: 400 }
      );
    }

    const code = generateCode();

    const loginEmail = body.email
      ? String(body.email).trim().toLowerCase()
      : `${slugify(firstName)}.${slugify(lastName)}.${code}@tmfit.local`;

    const temporaryPassword = `TMfit${code}!`;

    const { data: createdUser, error: createUserError } =
      await adminSupabase.auth.admin.createUser({
        email: loginEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: `${firstName} ${lastName}`,
          role: "client"
        }
      });

    if (createUserError) {
      return NextResponse.json(
        { error: createUserError.message },
        { status: 400 }
      );
    }

    const clientUserId = createdUser.user.id;

    const { error: profileInsertError } = await adminSupabase
      .from("profiles")
      .insert({
        id: clientUserId,
        role: "client",
        full_name: `${firstName} ${lastName}`
      });

    if (profileInsertError) {
      return NextResponse.json(
        { error: profileInsertError.message },
        { status: 400 }
      );
    }

    const { data: client, error: clientInsertError } = await adminSupabase
      .from("clients")
      .insert({
        user_id: clientUserId,
        professional_id: user.id,
        client_code: code,
        first_name: firstName,
        last_name: lastName,
        email: loginEmail,
        phone: body.phone || null,
        gender: body.gender || "uomo",
        birth_date: body.birth_date || null,
        height_cm: body.height_cm ? Number(body.height_cm) : null,
        goal: body.goal || null,
        notes: body.notes || null
      })
      .select()
      .single();

    if (clientInsertError) {
      return NextResponse.json(
        { error: clientInsertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      client,
      login_email: loginEmail,
      temporary_password: temporaryPassword
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Errore server." },
      { status: 500 }
    );
  }
}
