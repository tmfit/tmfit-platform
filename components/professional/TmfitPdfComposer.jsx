"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_SETTINGS = {
  duration_text: "5 settimane",
  meals_count: 4,
  objective: "",
  weight_kg: "",
  height_cm: "",
  calorie_target: "",
  carbs: "",
  proteins: "",
  fats: "",
  notes: ""
};

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function safeName(value) {
  return (
    normalizeText(value)
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "file"
  );
}

function fullName(client) {
  return `${client?.first_name || ""} ${client?.last_name || ""}`.trim() || "Cliente";
}

function activeSupplements(items = []) {
  return items.filter(
    (item) => String(item?.status || "active").toLowerCase() === "active"
  );
}

function supplementInstruction(item) {
  const explicit = normalizeText(item?.client_instruction);
  if (explicit) return explicit;

  const dose = [normalizeText(item?.dose), normalizeText(item?.units)]
    .filter(Boolean)
    .join(" ");
  return [dose, normalizeText(item?.timing), normalizeText(item?.frequency)]
    .filter(Boolean)
    .join(" · ");
}

function loadPdfLib() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PDF disponibile solo nel browser."));
  }

  if (window.PDFLib) return Promise.resolve(window.PDFLib);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-tmfit-pdflib='true']");

    if (existing) {
      existing.addEventListener("load", () => resolve(window.PDFLib), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Impossibile caricare il motore PDF.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js";
    script.async = true;
    script.dataset.tmfitPdflib = "true";
    script.onload = () => {
      if (window.PDFLib) resolve(window.PDFLib);
      else reject(new Error("Motore PDF non disponibile."));
    };
    script.onerror = () => reject(new Error("Impossibile caricare il motore PDF."));
    document.head.appendChild(script);
  });
}

function wrapText(font, text, size, maxWidth) {
  const clean = String(text || "").trim();
  if (!clean) return [];

  const words = clean.split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      return;
    }

    if (current) lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines;
}

function drawCentered(page, font, text, top, size, options = {}) {
  const value = normalizeText(text);
  if (!value) return;

  const width = page.getWidth();
  const textWidth = font.widthOfTextAtSize(value, size);
  const x = Math.max(options.minX || 30, (width - textWidth) / 2);
  page.drawText(value, {
    x,
    y: page.getHeight() - top - size,
    size,
    font,
    color: options.color
  });
}

function drawCenteredWrapped(page, font, text, top, size, maxWidth, lineHeight) {
  let currentSize = size;
  let lines = wrapText(font, text, currentSize, maxWidth);

  while (lines.length > 2 && currentSize > 8) {
    currentSize -= 0.5;
    lines = wrapText(font, text, currentSize, maxWidth);
  }

  lines.slice(0, 2).forEach((line, index) => {
    drawCentered(page, font, line, top + index * lineHeight, currentSize);
  });
}

function drawCenteredInRange(page, font, text, left, right, top, size, color) {
  const value = normalizeText(text);
  if (!value) return;
  const width = font.widthOfTextAtSize(value, size);
  page.drawText(value, {
    x: left + Math.max(0, (right - left - width) / 2),
    y: page.getHeight() - top - size,
    size,
    font,
    color
  });
}

function drawCenteredWrappedInRange(
  page,
  font,
  text,
  left,
  right,
  top,
  size,
  maxLines = 2,
  lineHeight = 12,
  color
) {
  const maxWidth = Math.max(20, right - left - 10);
  let currentSize = size;
  let lines = wrapText(font, text, currentSize, maxWidth);
  while (lines.length > maxLines && currentSize > 7) {
    currentSize -= 0.4;
    lines = wrapText(font, text, currentSize, maxWidth);
  }
  lines.slice(0, maxLines).forEach((line, index) => {
    drawCenteredInRange(
      page,
      font,
      line,
      left,
      right,
      top + index * lineHeight,
      currentSize,
      color
    );
  });
}

function drawTopText(page, font, text, x, top, size, color) {
  if (!normalizeText(text)) return;
  page.drawText(String(text), {
    x,
    y: page.getHeight() - top - size,
    size,
    font,
    color
  });
}

function fitNoteLines(font, rawNotes, maxWidth = 400, maxHeight = 142) {
  const sourceLines = String(rawNotes || "")
    .split(/\n+/)
    .map((item) => item.replace(/^[-•o]\s*/i, "").trim())
    .filter(Boolean);

  for (let size = 10.5; size >= 7.5; size -= 0.5) {
    const lineHeight = size * 1.35;
    const out = [];

    sourceLines.forEach((source) => {
      const wrapped = wrapText(font, source, size, maxWidth);
      wrapped.forEach((line) => out.push({ text: line }));
      out.push({ spacer: true });
    });

    if (out.length && out[out.length - 1].spacer) out.pop();
    const height = out.reduce(
      (sum, line) => sum + (line.spacer ? lineHeight * 0.6 : lineHeight),
      0
    );
    if (height <= maxHeight) return { size, lineHeight, lines: out };
  }

  return { size: 7.5, lineHeight: 10, lines: [] };
}

function drawCellText(page, font, text, x, top, width, rowHeight, size = 7.2) {
  const clean = normalizeText(text);
  if (!clean) return;

  let currentSize = size;
  let lines = wrapText(font, clean, currentSize, width);
  while (lines.length > 3 && currentSize > 5.8) {
    currentSize -= 0.3;
    lines = wrapText(font, clean, currentSize, width);
  }

  const lineHeight = currentSize * 1.12;
  const maxLines = Math.max(1, Math.floor((rowHeight - 5) / lineHeight));
  lines.slice(0, maxLines).forEach((line, index) => {
    drawTopText(page, font, line, x, top + index * lineHeight, currentSize);
  });
}

function percentValue(value) {
  const numeric = Number(String(value ?? "").replace(",", ".").replace("%", "").trim());
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

async function macroChartPng(settings) {
  if (typeof document === "undefined") return null;

  const values = [
    { label: "Carboidrati", value: percentValue(settings.carbs), color: "#254f78" },
    { label: "Proteine", value: percentValue(settings.proteins), color: "#986b66" },
    { label: "Grassi", value: percentValue(settings.fats), color: "#c7b897" }
  ];
  const total = values.reduce((sum, item) => sum + item.value, 0);
  if (!total) return null;

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 520;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = 275;
  const cy = 255;
  const radius = 175;
  const inner = 92;
  let angle = -Math.PI / 2;

  values.forEach((item) => {
    const span = (item.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + span);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    angle += span;
  });

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = "#0b2440";
  ctx.font = "600 28px Arial";
  ctx.textAlign = "left";
  values.forEach((item, index) => {
    const y = 150 + index * 90;
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(560, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0b2440";
    ctx.font = "600 25px Arial";
    ctx.fillText(`${item.label} ${item.value}%`, 590, y + 8);
  });

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}

export default function TmfitPdfComposer({
  client,
  supabase,
  professionalId,
  supplements = [],
  latestMeasurement = null,
  onGeneratedFile
}) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [sourceRows, setSourceRows] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sourceBusy, setSourceBusy] = useState(false);
  const [message, setMessage] = useState("");

  const activeIntegration = useMemo(
    () => activeSupplements(supplements),
    [supplements]
  );

  async function reloadSources(clientId = client?.id) {
    if (!clientId || !supabase) return [];
    const { data, error } = await supabase
      .from("client_pdf_sources")
      .select("*")
      .eq("client_id", Number(clientId))
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("TMFIT PDF sources:", error.message);
      return [];
    }
    setSourceRows(data || []);
    return data || [];
  }

  useEffect(() => {
    if (!client?.id || !supabase) {
      setSettings(DEFAULT_SETTINGS);
      setSourceRows([]);
      setPendingFiles([]);
      return;
    }

    let alive = true;

    async function load() {
      setLoading(true);
      setMessage("");

      const [{ data: profile, error: profileError }, { data: sources, error: sourceError }] =
        await Promise.all([
          supabase
            .from("client_pdf_settings")
            .select("*")
            .eq("client_id", Number(client.id))
            .maybeSingle(),
          supabase
            .from("client_pdf_sources")
            .select("*")
            .eq("client_id", Number(client.id))
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true })
        ]);

      if (!alive) return;

      if (profileError) console.warn("TMFIT PDF settings:", profileError.message);
      if (sourceError) console.warn("TMFIT PDF sources:", sourceError.message);

      setSettings({
        ...DEFAULT_SETTINGS,
        objective: client.goal || "",
        weight_kg: latestMeasurement?.weight_kg || "",
        height_cm: client.height_cm || "",
        ...(profile || {})
      });
      setSourceRows(sources || []);
      setPendingFiles([]);
      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [client?.id, supabase]);

  useEffect(() => {
    if (!client?.id) return;
    setSettings((current) => ({
      ...current,
      objective: current.objective || client.goal || "",
      height_cm: current.height_cm || client.height_cm || "",
      weight_kg: current.weight_kg || latestMeasurement?.weight_kg || ""
    }));
  }, [client?.id, client?.goal, client?.height_cm, latestMeasurement?.weight_kg]);

  function updateField(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function saveSettings(showSuccess = true) {
    if (!client?.id || !supabase || !professionalId) return false;
    setSaving(true);

    const payload = {
      client_id: Number(client.id),
      professional_id: professionalId,
      duration_text: normalizeText(settings.duration_text) || null,
      meals_count: Number(settings.meals_count) || null,
      objective: normalizeText(settings.objective) || null,
      weight_kg: settings.weight_kg === "" ? null : Number(settings.weight_kg),
      height_cm: settings.height_cm === "" ? null : Number(settings.height_cm),
      calorie_target: normalizeText(settings.calorie_target) || null,
      carbs: normalizeText(settings.carbs) || null,
      proteins: normalizeText(settings.proteins) || null,
      fats: normalizeText(settings.fats) || null,
      notes: String(settings.notes || "").trim() || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("client_pdf_settings")
      .upsert(payload, { onConflict: "client_id" });

    setSaving(false);
    if (error) {
      setMessage(`Errore salvataggio dati PDF: ${error.message}`);
      return false;
    }

    if (showSuccess) setMessage("Dati PDF salvati.");
    return true;
  }

  async function uploadPendingSources() {
    if (!pendingFiles.length) return sourceRows;
    if (!client?.id || !supabase || !professionalId) return sourceRows;

    setSourceBusy(true);
    try {
      const baseOrder = sourceRows.length;
      const inserted = [];

      for (let index = 0; index < pendingFiles.length; index += 1) {
        const file = pendingFiles[index];
        if (!String(file.name || "").toLowerCase().endsWith(".pdf")) {
          throw new Error(`Il file ${file.name || "selezionato"} non è un PDF.`);
        }

        const path = `${client.id}/sources/${Date.now()}-${index}-${safeName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("diets")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data, error } = await supabase
          .from("client_pdf_sources")
          .insert({
            client_id: Number(client.id),
            professional_id: professionalId,
            source_type: "sifa_attachment",
            display_name: file.name,
            file_name: file.name,
            file_path: path,
            sort_order: baseOrder + index,
            updated_at: new Date().toISOString()
          })
          .select("*")
          .single();

        if (error) {
          await supabase.storage.from("diets").remove([path]);
          throw error;
        }
        inserted.push(data);
      }

      const next = [...sourceRows, ...inserted].sort(
        (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
      );
      setSourceRows(next);
      setPendingFiles([]);
      return next;
    } finally {
      setSourceBusy(false);
    }
  }

  async function persistSourceOrder(rows) {
    const updates = rows.map((row, index) =>
      supabase
        .from("client_pdf_sources")
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq("id", row.id)
        .eq("client_id", Number(client.id))
    );
    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;
  }

  async function moveSource(index, delta) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= sourceRows.length || sourceBusy) return;

    const next = [...sourceRows];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setSourceRows(next.map((row, rowIndex) => ({ ...row, sort_order: rowIndex })));
    setSourceBusy(true);
    try {
      await persistSourceOrder(next);
    } catch (error) {
      setMessage(`Ordine allegati non salvato: ${error.message}`);
      await reloadSources();
    } finally {
      setSourceBusy(false);
    }
  }

  async function removeSource(row) {
    if (!row?.id || sourceBusy) return;
    const confirmed = window.confirm(`Rimuovere “${row.display_name || row.file_name}” dal PDF completo?`);
    if (!confirmed) return;

    setSourceBusy(true);
    try {
      const { error } = await supabase
        .from("client_pdf_sources")
        .delete()
        .eq("id", row.id)
        .eq("client_id", Number(client.id));
      if (error) throw error;

      if (row.file_path) {
        const { error: storageError } = await supabase.storage
          .from("diets")
          .remove([row.file_path]);
        if (storageError) console.warn("TMFIT PDF source cleanup:", storageError.message);
      }

      const next = sourceRows.filter((item) => String(item.id) !== String(row.id));
      setSourceRows(next);
      await persistSourceOrder(next);
      await reloadSources();
    } catch (error) {
      setMessage(`Impossibile rimuovere l'allegato: ${error.message}`);
    } finally {
      setSourceBusy(false);
    }
  }

  async function sourceBytes(row) {
    if (!row?.file_path) return null;
    const { data, error } = await supabase.storage.from("diets").download(row.file_path);
    if (error) throw error;
    return new Uint8Array(await data.arrayBuffer());
  }

  async function generatePdf() {
    if (!client?.id) {
      setMessage("Seleziona prima un cliente.");
      return;
    }

    setGenerating(true);
    setMessage("");

    try {
      const saved = await saveSettings(false);
      if (!saved) return;

      const sources = pendingFiles.length ? await uploadPendingSources() : sourceRows;
      if (!sources.length) {
        throw new Error("Carica almeno un PDF SIFA/allegato da aggiungere dopo le prime 6 pagine.");
      }

      const PDFLib = await loadPdfLib();
      const { PDFDocument, StandardFonts, rgb } = PDFLib;

      const masterResponse = await fetch("/tmfit-plan-master.pdf", { cache: "no-store" });
      if (!masterResponse.ok) {
        throw new Error("Template TMFIT non trovato in /public/tmfit-plan-master.pdf.");
      }

      const masterBytes = new Uint8Array(await masterResponse.arrayBuffer());
      const output = await PDFDocument.load(masterBytes);
      const helvetica = await output.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await output.embedFont(StandardFonts.HelveticaBold);
      const navy = rgb(0.043, 0.153, 0.271);
      const textColor = rgb(0.094, 0.133, 0.188);
      const muted = rgb(0.40, 0.44, 0.52);

      // Master V5.3: le prime 6 pagine hanno grafica TMFIT fissa e campi
      // intenzionalmente vuoti. Qui vengono inseriti solo i dati del cliente.
      const cover = output.getPage(0);
      const coverWidth = cover.getWidth();
      const coverLeft = 48;
      const coverRight = coverWidth - 48;
      const coverCol = (coverRight - coverLeft) / 3;

      drawCentered(cover, helveticaBold, fullName(client).toUpperCase(), 444, 14.5, {
        color: navy
      });
      drawCenteredInRange(
        cover,
        helveticaBold,
        normalizeText(settings.duration_text) || "—",
        coverLeft,
        coverLeft + coverCol,
        600,
        11.5,
        textColor
      );
      drawCenteredInRange(
        cover,
        helveticaBold,
        `${Number(settings.meals_count) || "—"} pasti`,
        coverLeft + coverCol,
        coverLeft + coverCol * 2,
        600,
        11.5,
        textColor
      );
      drawCenteredWrappedInRange(
        cover,
        helveticaBold,
        normalizeText(settings.objective) || "—",
        coverLeft + coverCol * 2,
        coverRight,
        592,
        9.2,
        3,
        11,
        textColor
      );

      const detail = output.getPage(5);
      const detailWidth = detail.getWidth();
      const detailLeft = 44;
      const detailRight = detailWidth - 44;
      const profileCol = (detailRight - detailLeft) / 3;

      drawCenteredInRange(
        detail,
        helveticaBold,
        settings.weight_kg === "" ? "—" : `${settings.weight_kg} kg`,
        detailLeft,
        detailLeft + profileCol,
        158,
        11.5,
        navy
      );
      drawCenteredInRange(
        detail,
        helveticaBold,
        settings.height_cm === "" ? "—" : `${settings.height_cm} cm`,
        detailLeft + profileCol,
        detailLeft + profileCol * 2,
        158,
        11.5,
        navy
      );
      drawCenteredWrappedInRange(
        detail,
        helveticaBold,
        normalizeText(settings.objective) || "—",
        detailLeft + profileCol * 2,
        detailRight,
        153,
        8.8,
        3,
        10.5,
        navy
      );

      drawTopText(
        detail,
        helveticaBold,
        normalizeText(settings.calorie_target) || "—",
        44,
        286,
        17,
        navy
      );

      const chartBytes = await macroChartPng(settings);
      if (chartBytes) {
        const chart = await output.embedPng(chartBytes);
        detail.drawImage(chart, { x: 43, y: 337, width: 244, height: 141 });
      } else {
        const macroLine = [
          settings.carbs ? `Carboidrati ${settings.carbs}` : null,
          settings.proteins ? `Proteine ${settings.proteins}` : null,
          settings.fats ? `Grassi ${settings.fats}` : null
        ]
          .filter(Boolean)
          .join(" · ");
        if (macroLine) {
          const lines = wrapText(helvetica, macroLine, 8.2, 230);
          lines.slice(0, 3).forEach((line, index) => {
            drawTopText(detail, helvetica, line, 44, 332 + index * 12, 8.2, muted);
          });
        }
      }

      // Note personalizzate: paragrafi distanziati, senza numerazione o bullet.
      const noteLayout = fitNoteLines(helvetica, settings.notes, 210, 225);
      let noteTop = 282;
      noteLayout.lines.forEach((line) => {
        if (line.spacer) {
          noteTop += noteLayout.lineHeight * 0.72;
          return;
        }
        drawTopText(detail, helvetica, line.text, 329, noteTop, noteLayout.size, textColor);
        noteTop += noteLayout.lineHeight;
      });

      // Integrazione: una sola compilazione nella rubrica TMFIT.
      // Il master dispone di 6 righe; se gli integratori sono di più, l'app avvisa.
      const rows = activeIntegration.slice(0, 6);
      const rowTop = 624;
      const rowHeight = 28;
      rows.forEach((item, index) => {
        const top = rowTop + index * rowHeight;
        drawCellText(
          detail,
          helveticaBold,
          item.supplement_name || "Integratore",
          55,
          top,
          150,
          rowHeight,
          7.1
        );
        drawCellText(
          detail,
          helvetica,
          supplementInstruction(item),
          227,
          top,
          150,
          rowHeight,
          6.9
        );
        drawCellText(
          detail,
          helvetica,
          item.amazon_url || item.product_name || "",
          400,
          top,
          140,
          rowHeight,
          6.2
        );
      });

      // Dopo le prime 6 pagine TMFIT concatena TUTTI gli allegati nell'ordine scelto.
      const orderedSources = [...sources].sort(
        (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
      );
      for (const row of orderedSources) {
        const bytes = await sourceBytes(row);
        if (!bytes) continue;
        const sourceDoc = await PDFDocument.load(bytes);
        const pages = await output.copyPages(sourceDoc, sourceDoc.getPageIndices());
        pages.forEach((page) => output.addPage(page));
      }

      const bytes = await output.save();
      const fileName = `PAP ${fullName(client).toUpperCase()}.pdf`;
      const file = new File([bytes], fileName, { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 3000);

      if (onGeneratedFile) onGeneratedFile(file, settings);
      setMessage(
        activeIntegration.length > 6
          ? "PDF generato. Nota: nelle prime 6 pagine entrano i primi 6 integratori attivi."
          : `PDF completo generato: 6 pagine TMFIT + ${orderedSources.length} allegat${orderedSources.length === 1 ? "o" : "i"}.`
      );
    } catch (error) {
      console.error("TMFIT PDF composer", error);
      setMessage(error?.message || "Errore durante la generazione PDF.");
    } finally {
      setGenerating(false);
    }
  }

  if (!client) {
    return (
      <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="font-black text-slate-950">Seleziona un cliente</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          I dati del PDF vengono salvati per ogni singolo cliente.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#07111f] p-5 text-white md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
          PDF Composer
        </p>
        <h3 className="mt-2 text-2xl font-black">Piano completo · {fullName(client)}</h3>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
          Compila solo i dati chiave delle prime 6 pagine. Gli integratori arrivano dalla rubrica TMFIT; dopo il frontespizio puoi aggiungere 1, 2 o più PDF SIFA nell’ordine che preferisci.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-5 text-sm font-black text-slate-500">
            Caricamento dati PDF...
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Durata</span>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-300" value={settings.duration_text || ""} onChange={(e) => updateField("duration_text", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Numero pasti</span>
                <input type="number" min="1" max="10" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-300" value={settings.meals_count || ""} onChange={(e) => updateField("meals_count", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Peso kg</span>
                <input type="number" step="0.1" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-300" value={settings.weight_kg || ""} onChange={(e) => updateField("weight_kg", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Altezza cm</span>
                <input type="number" step="0.1" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-300" value={settings.height_cm || ""} onChange={(e) => updateField("height_cm", e.target.value)} />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Obiettivo</span>
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-300" value={settings.objective || ""} onChange={(e) => updateField("objective", e.target.value)} />
            </label>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Calorie</span>
                <input placeholder="Es. 2000 - 1800 kcal/die" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-300" value={settings.calorie_target || ""} onChange={(e) => updateField("calorie_target", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Carboidrati</span>
                <input placeholder="Es. 50%" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-300" value={settings.carbs || ""} onChange={(e) => updateField("carbs", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Proteine</span>
                <input placeholder="Es. 30%" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-300" value={settings.proteins || ""} onChange={(e) => updateField("proteins", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Grassi</span>
                <input placeholder="Es. 20%" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-teal-300" value={settings.fats || ""} onChange={(e) => updateField("fats", e.target.value)} />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Note pagina TMFIT</span>
              <textarea rows="5" placeholder="Una indicazione per riga" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold leading-6 outline-none focus:border-teal-300" value={settings.notes || ""} onChange={(e) => updateField("notes", e.target.value)} />
              <span className="mt-1 block text-xs font-semibold text-slate-400">Una riga = una nota. Nel PDF saranno semplicemente distanziate, senza numerazione automatica.</span>
            </label>

            <div className="rounded-3xl border border-teal-100 bg-teal-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-teal-700">Integrazione automatica</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{activeIntegration.length} integratori attivi richiamati dalla rubrica TMFIT</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-teal-700">Nessuna doppia compilazione</span>
              </div>
              {activeIntegration.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {activeIntegration.slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white p-3">
                      <p className="text-sm font-black text-slate-950">{item.supplement_name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{supplementInstruction(item) || "Indicazioni non compilate"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">PDF aggiuntivi SIFA</p>
                  <p className="mt-1 text-sm font-black text-slate-950">Verranno inseriti dopo le prime 6 pagine, nell’ordine mostrato.</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">{sourceRows.length + pendingFiles.length} file</span>
              </div>

              {sourceRows.length > 0 && (
                <div className="mt-4 space-y-2">
                  {sourceRows.map((row, index) => (
                    <div key={row.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-950">{index + 1}. {row.display_name || row.file_name}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-400">PDF salvato</p>
                      </div>
                      <button type="button" disabled={index === 0 || sourceBusy} onClick={() => moveSource(index, -1)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black disabled:opacity-30">Su</button>
                      <button type="button" disabled={index === sourceRows.length - 1 || sourceBusy} onClick={() => moveSource(index, 1)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black disabled:opacity-30">Giù</button>
                      <button type="button" disabled={sourceBusy} onClick={() => removeSource(row)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-30">Rimuovi</button>
                    </div>
                  ))}
                </div>
              )}

              {pendingFiles.length > 0 && (
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Da caricare</p>
                  {pendingFiles.map((file, index) => (
                    <p key={`${file.name}-${index}`} className="mt-1 truncate text-sm font-bold text-slate-700">{sourceRows.length + index + 1}. {file.name}</p>
                  ))}
                </div>
              )}

              <label className="mt-4 block rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                <span className="text-sm font-black text-slate-950">Aggiungi uno o più PDF</span>
                <input
                  type="file"
                  multiple
                  accept="application/pdf,.pdf"
                  onChange={(event) => {
                    const next = Array.from(event.target.files || []).filter((file) => String(file.name || "").toLowerCase().endsWith(".pdf"));
                    setPendingFiles((current) => [...current, ...next]);
                    event.target.value = "";
                  }}
                  className="mt-3 block w-full text-sm font-bold"
                />
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">Puoi selezionare insieme dieta SIFA, lista della spesa ed eventuali altri PDF. Dopo il caricamento puoi riordinarli.</p>
              </label>
            </div>

            {message && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700">{message}</div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => saveSettings(true)} disabled={saving || generating || sourceBusy} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 disabled:opacity-50">
                {saving ? "Salvataggio..." : "Salva dati chiave"}
              </button>
              <button type="button" onClick={generatePdf} disabled={generating || saving || sourceBusy} className="min-h-12 rounded-2xl bg-[#07111f] px-4 text-sm font-black text-white disabled:opacity-50">
                {generating ? "Generazione PDF..." : "Genera PDF completo"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
