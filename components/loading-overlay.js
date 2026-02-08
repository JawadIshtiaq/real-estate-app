"use client";

export default function LoadingOverlay({ show, label }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="loader" />
        <div className="text-sm text-red-700/80">{label || "Working..."}</div>
      </div>
    </div>
  );
}
