import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Download,
  Link as LinkIcon,
  Type,
  ContactRound,
  Copy,
  Check,
  QrCode,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Prepends https:// to bare domains so scanners open the URL directly. */
function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  // Keep explicit schemes (https://, http://, mailto:, tel:, …) untouched.
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) return value;
  return `https://${value}`;
}

/** Escapes special characters inside vCard field values. */
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContactFields {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QRCodeGeneratorApp() {
  const [tab, setTab] = useState<"url" | "text" | "contact">("url");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement | null>(null);

  const [url, setUrl] = useState("openai.com");
  const [text, setText] = useState("Hello from my QR code!");
  const [contact, setContact] = useState<ContactFields>({
    firstName: "",
    lastName: "",
    company: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    address: "",
  });

  // Build the string that gets encoded into the QR code.
  const qrValue = useMemo(() => {
    if (tab === "url") return normalizeUrl(url);
    if (tab === "text") return text.trim();

    // vCard 3.0
    const fullName = `${contact.firstName} ${contact.lastName}`.trim();
    const website = normalizeUrl(contact.website);
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeVCard(contact.lastName)};${escapeVCard(contact.firstName)};;;`,
      `FN:${escapeVCard(fullName)}`,
      contact.company ? `ORG:${escapeVCard(contact.company)}` : "",
      contact.title ? `TITLE:${escapeVCard(contact.title)}` : "",
      contact.phone ? `TEL;TYPE=CELL:${escapeVCard(contact.phone)}` : "",
      contact.email ? `EMAIL:${escapeVCard(contact.email)}` : "",
      website ? `URL:${escapeVCard(website)}` : "",
      contact.address ? `ADR:;;${escapeVCard(contact.address)};;;;` : "",
      "END:VCARD",
    ].filter(Boolean);
    return lines.join("\n");
  }, [tab, url, text, contact]);

  const validationMessage = useMemo(() => {
    if (tab === "url")
      return qrValue
        ? "Scans will open the website directly."
        : "Enter a URL to generate a QR code.";
    if (tab === "text")
      return qrValue
        ? "Scans will show the text content."
        : "Enter text to generate a QR code.";
    return qrValue.includes("FN:")
      ? "Scans will offer to save a contact card."
      : "Fill in contact details to generate a QR code.";
  }, [tab, qrValue]);

  const canGenerate = useMemo(() => {
    if (tab === "url") return !!normalizeUrl(url);
    if (tab === "text") return !!text.trim();
    return !!(
      `${contact.firstName}${contact.lastName}${contact.phone}${contact.email}${contact.company}`.trim()
    );
  }, [tab, url, text, contact]);

  // Download the QR code as a PNG image.
  const downloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 4; // 4× for crisp high-res output
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `qr-${tab}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };
    img.src = svgUrl;
  };

  // Copy the encoded value to the clipboard.
  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const updateContact = (field: keyof ContactFields, value: string) =>
    setContact((prev) => ({ ...prev, [field]: value }));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-zinc-900 p-3 text-white shadow-sm">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Arrise Digital
              </h1>
              <p className="mt-1 text-xs text-zinc-400">
                partners are in progress
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ── Input card ── */}
          <Card className="rounded-3xl border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle>Build your QR code</CardTitle>
              <CardDescription>
                For URLs, the app automatically adds{" "}
                <span className="font-medium">https://</span> when needed so
                scanners open the site directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as typeof tab)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 rounded-2xl">
                  <TabsTrigger value="url" className="gap-2">
                    <LinkIcon className="h-4 w-4" /> URL
                  </TabsTrigger>
                  <TabsTrigger value="text" className="gap-2">
                    <Type className="h-4 w-4" /> Text
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="gap-2">
                    <ContactRound className="h-4 w-4" /> Contact
                  </TabsTrigger>
                </TabsList>

                {/* URL tab */}
                <TabsContent value="url" className="mt-6 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      placeholder="example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="rounded-2xl"
                    />
                  </div>
                  <p className="text-sm text-zinc-500">
                    Example output:{" "}
                    <span className="font-medium text-zinc-700">
                      {normalizeUrl(url) || "https://example.com"}
                    </span>
                  </p>
                </TabsContent>

                {/* Text tab */}
                <TabsContent value="text" className="mt-6 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="text">Text content</Label>
                    <Textarea
                      id="text"
                      placeholder="Enter any message or note"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[160px] rounded-2xl"
                    />
                  </div>
                </TabsContent>

                {/* Contact tab */}
                <TabsContent value="contact" className="mt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        ["firstName", "First name"],
                        ["lastName", "Last name"],
                        ["company", "Company"],
                        ["title", "Job title"],
                        ["phone", "Phone"],
                        ["email", "Email"],
                      ] as [keyof ContactFields, string][]
                    ).map(([field, label]) => (
                      <div key={field} className="space-y-2">
                        <Label>{label}</Label>
                        <Input
                          value={contact[field]}
                          onChange={(e) => updateContact(field, e.target.value)}
                          className="rounded-2xl"
                        />
                      </div>
                    ))}
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Website</Label>
                      <Input
                        value={contact.website}
                        onChange={(e) => updateContact("website", e.target.value)}
                        placeholder="yourcompany.com"
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Address</Label>
                      <Textarea
                        value={contact.address}
                        onChange={(e) => updateContact("address", e.target.value)}
                        className="min-h-[110px] rounded-2xl"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* ── Preview card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>{validationMessage}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-5">
                  {/* QR display */}
                  <div
                    ref={qrRef}
                    className="flex min-h-[320px] w-full items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-6"
                  >
                    {canGenerate ? (
                      <QRCodeSVG
                        value={qrValue}
                        size={240}
                        level="M"
                        includeMargin
                        bgColor="#ffffff"
                        fgColor="#111111"
                      />
                    ) : (
                      <div className="text-center text-sm text-zinc-500">
                        Enter content to generate your QR code.
                      </div>
                    )}
                  </div>

                  {/* Encoded value */}
                  <div className="w-full rounded-2xl bg-zinc-100 p-3 text-xs text-zinc-600 break-all">
                    <span className="font-semibold text-zinc-800">
                      Encoded value:
                    </span>{" "}
                    {qrValue || "Nothing yet"}
                  </div>

                  {/* Actions */}
                  <div className="grid w-full gap-3 sm:grid-cols-2">
                    <Button
                      onClick={downloadQr}
                      disabled={!canGenerate}
                      className="rounded-2xl"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download PNG
                    </Button>
                    <Button
                      onClick={copyValue}
                      disabled={!canGenerate}
                      variant="secondary"
                      className="rounded-2xl"
                    >
                      {copied ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {copied ? "Copied" : "Copy value"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
