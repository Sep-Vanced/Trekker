"use client";

import {
    ArrowLeft,
    Camera,
    CheckCircle,
    LogIn,
    LogOut,
    QrCode,
    ScanLine,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ScanAction = "entry" | "exit";

function parseQrPayload(raw: string) {
  const parts = raw.split("|");
  if (parts.length < 2) return null;
  return {
    prefix: parts[0],
    trackingId: parts[1],
    routeId: parts[2],
    userId: parts[3],
    date: parts[4],
  };
}

export default function ScanScreen() {
  const [qrInput, setQrInput] = useState("");
  const [action, setAction] = useState<ScanAction>("entry");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    visible: boolean;
    success: boolean;
    message: string;
  }>({ visible: false, success: false, message: "" });
  const [parsedInfo, setParsedInfo] =
    useState<ReturnType<typeof parseQrPayload>>(null);

  const handleQrChange = (val: string) => {
    setQrInput(val);
    setResult({ ...result, visible: false });
    setParsedInfo(parseQrPayload(val));
  };

  const processEntry = async (
    raw: string,
    parsed: NonNullable<ReturnType<typeof parseQrPayload>>,
    currentAction: ScanAction,
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/tourism/ranger/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_payload: raw.trim(), action: currentAction }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ visible: true, success: true, message: data.message });
        setQrInput("");
        setParsedInfo(null);
      } else {
        setResult({
          visible: true,
          success: false,
          message: data.detail || "Failed to process QR.",
        });
      }
    } catch {
      setResult({
        visible: true,
        success: false,
        message: "Network error. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!qrInput.trim()) {
      alert("Please enter or paste the QR payload.");
      return;
    }
    const parsed = parseQrPayload(qrInput.trim());
    if (!parsed || parsed.prefix !== "SMARTTREK") {
      alert("The QR payload format is not recognized.");
      return;
    }
    await processEntry(qrInput.trim(), parsed, action);
  };

  const isEntry = action === "entry";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-5 pt-6 pb-6 bg-green-900">
        <Link
          href="/ranger/dashboard"
          className="flex flex-row items-center mb-4"
        >
          <ArrowLeft size={18} color="#4cde80" />
          <span className="text-[#4cde80] text-sm font-semibold ml-1">
            Back
          </span>
        </Link>
        <p className="text-[#4cde80] text-[11px] font-bold uppercase tracking-[2px] mb-1">
          Ranger Control
        </p>
        <h1 className="text-white text-2xl font-extrabold">QR Scanner</h1>
        <p className="text-white/50 text-[13px] mt-1">
          Scan travelers QR codes for entry or exit
        </p>
      </div>

      <div className="px-5 pt-5 pb-28">
        {/* Scanner placeholder box */}
        <div className="h-[260px] rounded-3xl mb-6 overflow-hidden border border-black/10 bg-green-500/20 relative flex items-center justify-center">
          <div className="absolute top-3 left-3 w-7 h-7 border-t-4 border-l-4 border-green-600 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-7 h-7 border-t-4 border-r-4 border-green-600 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-7 h-7 border-b-4 border-l-4 border-green-600 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-7 h-7 border-b-4 border-r-4 border-green-600 rounded-br-lg" />
          <div className="flex flex-col items-center">
            <ScanLine size={52} color="#14532d" />
            <p className="text-green-900/40 text-xs font-medium mt-2 mb-3">
              Tap to open camera
            </p>
            <div className="flex flex-row items-center bg-green-700 px-4 py-2 rounded-full">
              <Camera size={14} color="#FFF" />
              <span className="text-white mx-1 text-xs font-bold">
                Open Camera
              </span>
            </div>
          </div>
        </div>

        {/* Action toggle */}
        <p className="text-black/50 text-[11px] font-bold uppercase tracking-[2px] mb-2">
          Action
        </p>
        <div className="flex flex-row bg-green-500/30 p-1.5 rounded-2xl border border-white/10">
          {(["entry", "exit"] as ScanAction[]).map((a) => {
            const isActive = action === a;
            const isEntryAction = a === "entry";
            return (
              <button
                key={a}
                onClick={() => setAction(a)}
                className="flex-1 py-3 rounded-xl flex flex-row items-center justify-center"
                style={{
                  backgroundColor: isActive
                    ? isEntryAction
                      ? "#1a4d2e"
                      : "#b91c1c"
                    : "transparent",
                }}
              >
                {isEntryAction ? (
                  <LogIn size={16} color={isActive ? "#FFFFFF" : "#14532d"} />
                ) : (
                  <LogOut size={16} color={isActive ? "#FFFFFF" : "#14532d"} />
                )}
                <span
                  className="text-[13px] font-semibold capitalize mx-1"
                  style={{ color: isActive ? "#FFFFFF" : "#14532d" }}
                >
                  {a}
                </span>
              </button>
            );
          })}
        </div>

        {/* QR Input */}
        <p className="text-black/50 text-[11px] font-bold uppercase tracking-[2px] mb-2 mt-5">
          QR Payload
        </p>
        <div className="rounded-2xl p-4 mb-5 border border-black/10 bg-green-500/10">
          <textarea
            className="w-full min-h-[80px] text-green-900 text-[13px] bg-transparent outline-none"
            placeholder="(ex.SMARTTREK|TRK-XXXXXXXX|...)"
            value={qrInput}
            onChange={(e) => handleQrChange(e.target.value)}
          />
        </div>

        {/* Parsed info preview */}
        {parsedInfo && (
          <div className="rounded-2xl p-3 mb-4 bg-[rgba(76,222,128,0.06)]">
            <p className="text-[#4cde80] text-[11px] font-bold uppercase tracking-[2px] mb-1">
              Parsed
            </p>
            {Object.entries(parsedInfo).map(([k, v]) => (
              <div key={k} className="flex flex-row justify-between">
                <span className="text-white/40 text-[11px] capitalize">
                  {k.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="text-white text-[11px] font-semibold">
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Result modal */}
        {result.visible && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-7">
            <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div
                className="flex flex-col items-center pt-9 pb-7 px-6"
                style={{
                  backgroundColor: result.success
                    ? isEntry
                      ? "#f0fdf4"
                      : "#fef2f2"
                    : "#fef2f2",
                }}
              >
                <div
                  className="w-[72px] h-[72px] rounded-3xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: result.success
                      ? isEntry
                        ? "#dcfce7"
                        : "#fee2e2"
                      : "#fee2e2",
                  }}
                >
                  {result.success ? (
                    isEntry ? (
                      <CheckCircle size={36} color="#16a34a" />
                    ) : (
                      <LogOut size={36} color="#dc2626" />
                    )
                  ) : (
                    <XCircle size={36} color="#dc2626" />
                  )}
                </div>
                <h2 className="text-[20px] font-extrabold text-gray-900 mb-1.5 text-center">
                  {result.success
                    ? isEntry
                      ? "Entry Recorded"
                      : "Exit Recorded"
                    : "Scan Failed"}
                </h2>
                <p className="text-[13px] text-gray-500 text-center leading-5">
                  {result.message}
                </p>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex flex-row p-4 gap-2.5">
                <button
                  onClick={() => setResult({ ...result, visible: false })}
                  className="flex-1 py-3.5 rounded-2xl bg-gray-100"
                >
                  <span className="text-[14px] font-bold text-gray-700">
                    Done
                  </span>
                </button>
                <button
                  onClick={() => {
                    setResult({ ...result, visible: false });
                    setQrInput("");
                  }}
                  className="flex-1 py-3.5 rounded-2xl flex flex-row items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: result.success
                      ? isEntry
                        ? "#16a34a"
                        : "#dc2626"
                      : "#dc2626",
                  }}
                >
                  <QrCode size={15} color="#fff" />
                  <span className="text-[14px] font-bold text-white">
                    Scan Again
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleScan}
          disabled={loading}
          className="w-full rounded-2xl py-5 flex flex-row items-center justify-center mt-2"
          style={{
            backgroundColor: action === "entry" ? "#1a4d2e" : "#b91c1c",
          }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <div className="flex flex-row items-center">
              {isEntry ? (
                <LogIn size={18} color="white" />
              ) : (
                <LogOut size={18} color="white" />
              )}
              <span className="text-white text-[15px] font-bold mx-2">
                Record {isEntry ? "Entry" : "Exit"}
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
