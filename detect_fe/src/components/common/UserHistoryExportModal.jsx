import React, { useState, useEffect, useRef } from "react";
import {
  MdClose, MdFileDownload, MdTableChart, MdCode, MdPictureAsPdf,
  MdCalendarToday, MdPerson, MdHistory, MdCheckCircle
} from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { adminService } from "../../services/adminService";
import { exportToCSV, exportToJSON, exportToPDF } from "../../utils/exportHelper";
import toast from "react-hot-toast";

const PRESETS = [
  { id: "1w",     label: "1 Week",    days: 7  },
  { id: "1m",     label: "1 Month",   days: 30 },
  { id: "3m",     label: "3 Months",  days: 90 },
  { id: "custom", label: "Custom Date", days: null },
];

const HISTORY_COLUMNS = [
  { key: "login_time",    label: "Date & Time"  },
  { key: "event_type",    label: "Event Type"   },
  { key: "status",        label: "Status"       },
  { key: "source_app",    label: "App"          },
  { key: "ip_address",    label: "IP Address"   },
  { key: "browser",       label: "Browser"      },
  { key: "os",            label: "OS"           },
  { key: "device",        label: "Device"       },
  { key: "location",      label: "Location"     },
  { key: "is_suspicious", label: "Suspicious"   },
  { key: "risk_score",    label: "Risk Score"   },
];

const UserHistoryExportModal = ({ users = [], onClose }) => {
  const [preset, setPreset]               = useState("1m");
  const [customStart, setCustomStart]     = useState("");
  const [customEnd, setCustomEnd]         = useState("");
  const [format, setFormat]               = useState("pdf");
  const [loading, setLoading]             = useState(false);
  const [preview, setPreview]             = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const overlayRef = useRef(null);

  const computeRange = () => {
    const now = new Date();
    const end = now.toISOString();
    if (preset === "custom") {
      return {
        start: customStart ? new Date(customStart).toISOString() : null,
        end: customEnd ? new Date(customEnd + "T23:59:59").toISOString() : null,
        label: customStart && customEnd ? customStart + " to " + customEnd : "All time",
      };
    }
    const p = PRESETS.find((p) => p.id === preset);
    const start = new Date(now.getTime() - p.days * 24 * 60 * 60 * 1000).toISOString();
    return { start, end, label: "Last " + p.label };
  };

  useEffect(() => {
    if (users.length !== 1) { setPreview(null); return; }
    const { start, end } = computeRange();
    if (preset === "custom" && (!customStart || !customEnd)) { setPreview(null); return; }
    let cancelled = false;
    (async () => {
      setPreviewLoading(true);
      try {
        const data = await adminService.getUserHistoryExport(users[0].id, start, end);
        if (!cancelled) setPreview({ username: data.user?.username, total: data.total });
      } catch {
        if (!cancelled) setPreview(null);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, customStart, customEnd, users]);

  const handleExport = async () => {
    if (users.length === 0) return;
    const { start, end, label } = computeRange();
    if (preset === "custom" && (!customStart || !customEnd)) {
      toast.error("Please select both start and end dates for custom range");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Fetching history for " + users.length + " user(s)...");
    try {
      const allResults = await Promise.all(
        users.map((u) => adminService.getUserHistoryExport(u.id, start, end))
      );
      const allLogs = allResults.flatMap((res) =>
        (res.logs || []).map((log) => ({
          username: res.user?.username || "",
          email: res.user?.email || "",
          ...log,
        }))
      );
      if (allLogs.length === 0) {
        toast.dismiss(toastId);
        toast.error("No login history found for the selected date range");
        setLoading(false);
        return;
      }
      const exportColumns = [
        { key: "username", label: "Username" },
        { key: "email",    label: "Email"    },
        ...HISTORY_COLUMNS,
      ];
      const baseFilename =
        users.length === 1
          ? "history_" + users[0].username + "_" + preset
          : "history_" + users.length + "users_" + preset;
      const meta = {
        title:      users.length === 1 ? "Login History - " + users[0].username : "Login History - " + users.length + " Users",
        subtitle:   "User Activity & Security Report - Detect Security Platform",
        dateRange:  label,
        reportedBy: "Admin",
        username:   users.length === 1 ? users[0].username : users.length + " users",
        email:      users.length === 1 ? users[0].email    : "",
      };
      let success = false;
      if (format === "csv")       success = exportToCSV(baseFilename, allLogs, exportColumns);
      else if (format === "json") success = exportToJSON(baseFilename, { meta, users: allResults });
      else                        success = await exportToPDF(baseFilename, allLogs, exportColumns, meta);
      toast.dismiss(toastId);
      if (success) {
        toast.success("Exported " + allLogs.length + " records as " + format.toUpperCase() + "!");
        onClose();
      } else {
        toast.error("Export failed - no data to write");
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Export error:", err);
      toast.error("Failed to fetch history for export");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e) => { if (e.target === overlayRef.current) onClose(); };

  if (users.length === 0) return null;

  const isCustomIncomplete = preset === "custom" && (!customStart || !customEnd);

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(2,6,18,0.78)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div style={{
        width: "100%", maxWidth: "560px", margin: "16px",
        background: "linear-gradient(145deg,#0d1526,#0f1e3a)",
        border: "1px solid rgba(56,189,248,0.22)",
        borderRadius: "16px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7),0 0 0 1px rgba(56,189,248,0.08)",
        overflow: "hidden",
        animation: "slideUpModal 0.25s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* HEADER */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(56,189,248,0.12)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          background: "rgba(56,189,248,0.04)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(56,189,248,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MdHistory style={{ fontSize: "1.2rem", color: "var(--clr-accent-cyan)" }} />
              </div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--clr-text-primary)" }}>
                Export User History
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--clr-text-muted)", paddingLeft: 46 }}>
              {users.length === 1
                ? <span>History for <strong style={{ color: "var(--clr-accent-cyan)" }}>{users[0].username}</strong></span>
                : <span><strong style={{ color: "var(--clr-accent-cyan)" }}>{users.length} users</strong> selected</span>
              }
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--clr-text-muted)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }}>
            <MdClose style={{ fontSize: "1.3rem" }} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: "20px 24px" }}>

          {/* Multi-user chips */}
          {users.length > 1 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Selected Users</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {users.slice(0, 6).map((u) => (
                  <span key={u.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", background: "rgba(56,189,248,0.1)", color: "var(--clr-accent-cyan)", border: "1px solid rgba(56,189,248,0.2)" }}>
                    <MdPerson style={{ fontSize: "0.85rem" }} /> {u.username}
                  </span>
                ))}
                {users.length > 6 && (
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", background: "rgba(255,255,255,0.05)", color: "var(--clr-text-muted)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    +{users.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* DATE RANGE PRESETS */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
              <FiClock style={{ fontSize: "0.85rem" }} /> Date Range
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESETS.map((p) => (
                <button key={p.id} onClick={() => setPreset(p.id)} style={{
                  padding: "7px 16px", borderRadius: 8, fontSize: "0.82rem",
                  fontWeight: preset === p.id ? 700 : 500, border: "1px solid", cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: preset === p.id ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.03)",
                  borderColor: preset === p.id ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.08)",
                  color: preset === p.id ? "var(--clr-accent-cyan)" : "var(--clr-text-secondary)",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  {p.id === "custom" && <MdCalendarToday style={{ fontSize: "0.85rem" }} />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM DATE INPUTS */}
          {preset === "custom" && (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20,
              padding: 14, background: "rgba(56,189,248,0.04)",
              border: "1px solid rgba(56,189,248,0.12)", borderRadius: 10,
            }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "var(--clr-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Start Date</label>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} max={customEnd || undefined}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(56,189,248,0.2)", color: "var(--clr-text-primary)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "var(--clr-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>End Date</label>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} min={customStart || undefined}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(56,189,248,0.2)", color: "var(--clr-text-primary)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
              </div>
            </div>
          )}

          {/* PREVIEW (single user) */}
          {users.length === 1 && (
            <div style={{
              padding: "10px 14px", borderRadius: 8, marginBottom: 20,
              background: previewLoading ? "rgba(255,255,255,0.03)" : preview !== null ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
              border: "1px solid",
              borderColor: previewLoading ? "rgba(255,255,255,0.08)" : preview !== null ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 10, fontSize: "0.82rem",
            }}>
              {previewLoading ? (
                <span style={{ color: "var(--clr-text-muted)" }}>Checking records...</span>
              ) : preview !== null ? (
                <>
                  <MdCheckCircle style={{ color: "#22c55e", fontSize: "1rem", flexShrink: 0 }} />
                  <span style={{ color: "var(--clr-text-secondary)" }}>
                    Found <strong style={{ color: "#22c55e" }}>{preview.total}</strong> record{preview.total !== 1 ? "s" : ""} for this period
                  </span>
                </>
              ) : (
                <span style={{ color: "var(--clr-text-muted)" }}>Select a date range to preview record count</span>
              )}
            </div>
          )}

          {/* FORMAT SELECTION */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Export Format</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { id: "pdf",  Icon: MdPictureAsPdf, label: "PDF",  desc: "Styled report",  color: "#ef4444" },
                { id: "csv",  Icon: MdTableChart,   label: "CSV",  desc: "Spreadsheet",    color: "#22c55e" },
                { id: "json", Icon: MdCode,         label: "JSON", desc: "Raw data",       color: "#3b82f6" },
              ].map(({ id, Icon, label, desc, color }) => {
                const sel = format === id;
                return (
                  <button key={id} onClick={() => setFormat(id)} style={{
                    padding: "12px 8px", borderRadius: 10, border: "1px solid", cursor: "pointer",
                    transition: "all 0.15s ease",
                    background: sel ? color + "18" : "rgba(255,255,255,0.02)",
                    borderColor: sel ? color + "66" : "rgba(255,255,255,0.07)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center",
                  }}>
                    <Icon style={{ fontSize: "1.4rem", color: sel ? color : "var(--clr-text-muted)", transition: "color 0.15s" }} />
                    <span style={{ fontSize: "0.82rem", fontWeight: sel ? 700 : 500, color: sel ? "var(--clr-text-primary)" : "var(--clr-text-secondary)" }}>{label}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--clr-text-muted)" }}>{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} disabled={loading} style={{ padding: "9px 20px", borderRadius: 8, fontSize: "0.875rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "var(--clr-text-secondary)", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleExport} disabled={loading || isCustomIncomplete} style={{
              padding: "9px 24px", borderRadius: 8, fontSize: "0.875rem", fontWeight: 700, border: "none",
              background: loading ? "rgba(56,189,248,0.3)" : "linear-gradient(135deg,rgba(56,189,248,0.9),rgba(99,102,241,0.9))",
              color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: loading ? "none" : "0 4px 14px rgba(56,189,248,0.3)",
              opacity: isCustomIncomplete ? 0.5 : 1, transition: "all 0.15s ease",
            }}>
              <MdFileDownload style={{ fontSize: "1.1rem" }} />
              {loading ? "Exporting..." : "Download " + format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default UserHistoryExportModal;
