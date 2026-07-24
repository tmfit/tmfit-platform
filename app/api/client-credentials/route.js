import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes
} from "node:crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const credentialsSecret = process.env.TMFIT_CREDENTIALS_SECRET;

const CREDENTIALS_TABLE = "client_access_credentials";

function jsonError(message, status = 400, code = "") {
  return NextResponse.json(
    { error: message, ...(code ? { code } : {}) },
    { status }
  );
}

function createSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Configurazione Supabase server incompleta.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function createSupabaseAuthClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configurazione Supabase pubblica incompleta.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function bearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

function encryptionKey() {
  if (!credentialsSecret || credentialsSecret.length < 32) {
    throw new Error(
      "TMFIT_CREDENTIALS_SECRET mancante o troppo breve: usa almeno 32 caratteri casuali."
    );
  }

  return createHash("sha256").update(credentialsSecret, "utf8").digest();
}

function encryptPassword(password) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(password), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url")
  ].join(".");
}

function decryptPassword(payload) {
  const [version, ivValue, tagValue, encryptedValue] = String(payload || "").split(".");

  if (version !== "v1" || !ivValue || !tagValue || !encryptedValue) {
    throw new Error("Formato credenziale cifrata non valido.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final()
  ]).toString("utf8");
}

function generateTemporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  let randomPart = "";

  for (let index = 0; index < bytes.length; index += 1) {
    randomPart += alphabet[bytes[index] % alphabet.length];
  }

  return `Tmfit-${randomPart}!7`;
}

async function professionalContext(request) {
  const token = bearerToken(request);

  if (!token) {
    return { error: jsonError("Sessione professionista mancante.", 401) };
  }

  const authClient = createSupabaseAuthClient();
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  const user = userData?.user;

  if (userError || !user) {
    return { error: jsonError("Sessione professionista non valida.", 401) };
  }

  const admin = createSupabaseAdmin();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "professional") {
    return { error: jsonError("Operazione riservata al professionista.", 403) };
  }

  return {
    admin,
    professionalId: user.id
  };
}

async function ownedClient(admin, clientId, professionalId) {
  const numericClientId = Number(clientId);

  if (!Number.isInteger(numericClientId) || numericClientId <= 0) {
    return { error: jsonError("Cliente non valido.", 400) };
  }

  const { data: client, error } = await admin
    .from("clients")
    .select("*")
    .eq("id", numericClientId)
    .maybeSingle();

  if (error) {
    return { error: jsonError(error.message, 500) };
  }

  if (!client) {
    return { error: jsonError("Cliente non trovato.", 404) };
  }

  const ownerId =
    client.professional_id || client.coach_id || client.created_by || "";

  if (!ownerId || String(ownerId) !== String(professionalId)) {
    return {
      error: jsonError(
        "Non è stato possibile verificare che il cliente appartenga al professionista autenticato.",
        403
      )
    };
  }

  return { client, numericClientId };
}

async function storedCredential(admin, clientId, professionalId) {
  return admin
    .from(CREDENTIALS_TABLE)
    .select("client_id, professional_id, login_email, encrypted_password, updated_at")
    .eq("client_id", clientId)
    .eq("professional_id", professionalId)
    .maybeSingle();
}

async function saveCredential({
  admin,
  clientId,
  professionalId,
  loginEmail,
  password
}) {
  const { data, error } = await admin
    .from(CREDENTIALS_TABLE)
    .upsert(
      {
        client_id: clientId,
        professional_id: professionalId,
        login_email: String(loginEmail || "").trim().toLowerCase(),
        encrypted_password: encryptPassword(password),
        updated_at: new Date().toISOString()
      },
      { onConflict: "client_id" }
    )
    .select("client_id, login_email, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function POST(request) {
  try {
    const context = await professionalContext(request);
    if (context.error) return context.error;

    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "read").trim().toLowerCase();
    const ownership = await ownedClient(
      context.admin,
      body.client_id,
      context.professionalId
    );

    if (ownership.error) return ownership.error;

    const { admin, professionalId } = context;
    const { client, numericClientId } = ownership;

    if (action === "store") {
      const loginEmail = String(body.login_email || client.email || "")
        .trim()
        .toLowerCase();
      const password = String(body.password || "");

      if (!loginEmail || !password) {
        return jsonError("Email e password sono obbligatorie per archiviare le credenziali.");
      }

      const saved = await saveCredential({
        admin,
        clientId: numericClientId,
        professionalId,
        loginEmail,
        password
      });

      return NextResponse.json({
        success: true,
        login_email: saved.login_email,
        updated_at: saved.updated_at
      });
    }

    if (action === "read") {
      const { data: record, error } = await storedCredential(
        admin,
        numericClientId,
        professionalId
      );

      if (error) return jsonError(error.message, 500);

      if (!record) {
        return jsonError(
          "Credenziali non archiviate per questo cliente.",
          404,
          "CREDENTIALS_NOT_STORED"
        );
      }

      let password = "";

      try {
        password = decryptPassword(record.encrypted_password);
      } catch (error) {
        console.error("TMFIT decrypt client credential:", error);
        return jsonError(
          "La credenziale archiviata non può essere decifrata. Verifica TMFIT_CREDENTIALS_SECRET.",
          500,
          "CREDENTIALS_DECRYPT_FAILED"
        );
      }

      return NextResponse.json({
        success: true,
        login_email: record.login_email,
        password,
        updated_at: record.updated_at
      });
    }

    if (action === "reset") {
      if (!client.user_id) {
        return jsonError(
          "Il cliente non è associato a un utente Supabase Auth.",
          409,
          "CLIENT_AUTH_USER_MISSING"
        );
      }

      const password = generateTemporaryPassword();
      const { data: existingRecord } = await storedCredential(
        admin,
        numericClientId,
        professionalId
      );

      let loginEmail = String(
        existingRecord?.login_email || client.email || ""
      )
        .trim()
        .toLowerCase();

      if (!loginEmail) {
        const { data: authUserData, error: authUserError } =
          await admin.auth.admin.getUserById(client.user_id);

        if (authUserError) return jsonError(authUserError.message, 500);
        loginEmail = String(authUserData?.user?.email || "").trim().toLowerCase();
      }

      if (!loginEmail) {
        return jsonError("Email di accesso del cliente non disponibile.", 409);
      }

      const { error: updateAuthError } = await admin.auth.admin.updateUserById(
        client.user_id,
        { password }
      );

      if (updateAuthError) return jsonError(updateAuthError.message, 500);

      await saveCredential({
        admin,
        clientId: numericClientId,
        professionalId,
        loginEmail,
        password
      });

      return NextResponse.json({
        success: true,
        login_email: loginEmail,
        password
      });
    }

    return jsonError("Azione credenziali non riconosciuta.", 400);
  } catch (error) {
    console.error("TMFIT client credentials route:", error);
    return jsonError(
      error?.message || "Errore imprevisto nella gestione credenziali.",
      500
    );
  }
}
