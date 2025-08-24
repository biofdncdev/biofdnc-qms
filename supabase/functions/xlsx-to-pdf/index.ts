// Deno Edge Function: Convert XLSX in Supabase Storage to PDF via Gotenberg
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOTENBERG_URL

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { bucket = "product_exports", path } = await req.json();
    if (!path) {
      return new Response(JSON.stringify({ error: "path required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const gotenbergUrl = Deno.env.get("GOTENBERG_URL")!; // e.g. https://gotenberg.example.com
    const supabase = createClient(supabaseUrl, serviceKey);

    // Download XLSX from storage as ArrayBuffer
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) throw error || new Error("download failed");
    const xlsxBuffer = await data.arrayBuffer();

    // Convert with Gotenberg LibreOffice
    const form = new FormData();
    form.append("files", new File([xlsxBuffer], "source.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    // Optional: landscape/other settings could be added
    const res = await fetch(`${gotenbergUrl}/forms/libreoffice/convert`, { method: "POST", body: form });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Gotenberg error: ${res.status} ${t}`);
    }
    const pdfBuf = await res.arrayBuffer();

    // Build pdf path by replacing .xlsx with .pdf
    const pdfPath = path.replace(/\.xlsx$/i, ".pdf");
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(pdfPath, new Blob([pdfBuf], { type: "application/pdf" }), { upsert: true, contentType: "application/pdf" });
    if (upErr) throw upErr;

    // Signed URL to return
    const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(pdfPath, 60 * 60);
    return new Response(JSON.stringify({ ok: true, path: pdfPath, url: signed?.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});


