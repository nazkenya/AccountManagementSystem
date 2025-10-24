// src/pages/AmProfile.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaUserTie,
  FaMapMarkerAlt,
  FaUsers, // DIUBAH: FaBuilding dihapus, FaUsers ditambah
  FaDownload,
  FaFilter,
} from "react-icons/fa";
import { getAMs } from "../../services/amService";
import SearchInput from "../../components/ui/SearchInput";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Card from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";

export default function AmProfile() {
  // State data & paging
  // DIUBAH: filter 'witel' diganti 'levelAm'
  const [ams, setAms] = useState([]);
  const [filter, setFilter] = useState({ q: "", region: "", levelAm: "", status: "" });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Hover/popover state
  const wrapperRef = useRef(null);
  const popRef = useRef(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [popoverKeep, setPopoverKeep] = useState(false);
  const clearTimeoutRef = useRef(null);
  const prevYRef = useRef(0);

  // constant for "no region"
  const NO_REGION_VALUE = "__NO_REGION__";

  // POPOVER FIELDS
  const POPOVER_FIELDS = [
    { key: "notel", label: "No. Telp" },
    { key: "email", label: "Email" },
    { key: "level_am", label: "Level AM" },
    { key: "tgl_aktif", label: "Tgl Aktif" },
    { key: "update_perpanjangan_kontrak", label: "Update Perpanjangan Kontrak" },
    { key: "tgl_akhir_kontrak_pro_hire", label: "Tgl Akhir Kontrak Pro Hire" },
    { key: "lama_menjadi_pro_hire", label: "Lama Menjadi Pro Hire" },
    { key: "tgl_out_sebagai_am", label: "Tgl Out Sebagai AM" },
    { key: "ket_out", label: "Keterangan Out" },
  ];

  // --- BARU: Opsi status AM ---
  const AM_STATUS_OPTIONS = [
    "AM PRO HIRE",
    "AM PRO HIRE MD",
    "AM SME",
    "AM ORGANIK",
    "AM ORGANIK MD",
  ];

  // --- helper: baca value field dengan berbagai casing
  const getFieldValue = (row, key) => {
    if (!row) return "";
    if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
    if (Object.prototype.hasOwnProperty.call(row, key.toUpperCase())) return row[key.toUpperCase()];
    if (Object.prototype.hasOwnProperty.call(row, key.toLowerCase())) return row[key.toLowerCase()];
    return "";
  };

  // Fetch data
  useEffect(() => {
    setLoading(true);

    // DIUBAH: 'witel' diganti 'level_am'
    const tableCols = ["id_sales", "nik_am", "nama_am", "tr", "level_am"];
    const popCols = POPOVER_FIELDS.map((f) => f.key);
    const fields = Array.from(
      new Set([...tableCols, ...popCols, "am_aktif_posisi_oktober_2025"])
    );

    getAMs(fields)
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setAms(data.data);
        } else {
          setAms(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error("Gagal fetch data AM:", err);
        setAms([]);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Unique lists
  const regions = useMemo(() => {
    const list = ams
      .map((m) => {
        const v = getFieldValue(m, "TR") ?? getFieldValue(m, "tr") ?? "";
        return String(v ?? "").trim();
      })
      .filter((v) => v && v.toLowerCase() !== "null" && v.toLowerCase() !== "undefined");
    return [...new Set(list)].sort((a, b) => a.localeCompare(b, "id"));
  }, [ams]);

  // DIHAPUS: useMemo untuk 'witels' dihapus

  // Filtering
  const filtered = useMemo(() => {
    return ams.filter((m) => {
      const regionRaw = getFieldValue(m, "TR") ?? getFieldValue(m, "tr") ?? "";
      const region = String(regionRaw ?? "").trim();

      // DIUBAH: Logika 'witel' diganti 'levelAm'
      const levelAmRaw = getFieldValue(m, "level_am") ?? getFieldValue(m, "LEVEL_AM") ?? "";
      const levelAm = String(levelAmRaw ?? "").trim();

      const nama = getFieldValue(m, "NAMA_AM") ?? getFieldValue(m, "nama_am") ?? "";
      const nik = getFieldValue(m, "NIK_AM") ?? getFieldValue(m, "nik_am") ?? "";
      const id = getFieldValue(m, "ID_SALES") ?? getFieldValue(m, "id_sales") ?? "";

      const rawActive =
        getFieldValue(m, "AM_AKTIF_POSISI_OKTOBER_2025") ??
        getFieldValue(m, "am_aktif_posisi_oktober_2025") ??
        getFieldValue(m, "AM_AKTIF") ??
        getFieldValue(m, "am_aktif") ??
        "";
      const activeNormalized = String(rawActive).trim().toLowerCase();

      // filter by region
      if (filter.region) {
        if (filter.region === NO_REGION_VALUE) {
          const rv = String(region ?? "").trim().toLowerCase();
          if (rv !== "" && rv !== "null" && rv !== "undefined") return false;
        } else {
          if (region !== filter.region) return false;
        }
      }

      // DIUBAH: filter by 'levelAm'
      if (filter.levelAm && levelAm !== filter.levelAm) return false;

      // DIHAPUS: filter by witel dihapus

      // filter status (Aktif / Non Aktif)
      if (
        filter.status === "aktif" &&
        !["aktif", "y", "yes", "1", "true", "active", "ya"].includes(activeNormalized)
      ) {
        return false;
      }
      if (
        filter.status === "non_aktif" &&
        ["aktif", "y", "yes", "1", "true", "active", "ya"].includes(activeNormalized)
      ) {
        return false;
      }

      // text search
      if (filter.q) {
        const q = filter.q.toLowerCase();
        return (
          id?.toString().toLowerCase().includes(q) ||
          nik?.toString().toLowerCase().includes(q) ||
          nama?.toString().toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [filter, ams]);

  // Pagination
  const total = filtered.length;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, total);
  const pageRows = filtered.slice(startIndex, endIndex);
  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => (endIndex < total ? p + 1 : p));

  // Table columns
  const columns = [
    { key: "ID_SALES", label: "ID SALES", render: (row) => getFieldValue(row, "ID_SALES") || getFieldValue(row, "id_sales") },
    { key: "NIK_AM", label: "NIK AM", render: (row) => getFieldValue(row, "NIK_AM") || getFieldValue(row, "nik_am") },
    {
      key: "NAMA_AM",
      label: "NAMA AM",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1]/25 via-[#7C3AED]/25 to-[#EC4899]/25 flex items-center justify-center text-[#2E3048] font-semibold text-xs">
            {String(getFieldValue(row, "NAMA_AM") || getFieldValue(row, "nama_am") || "").charAt(0)}
          </div>
          <span className="font-medium">{getFieldValue(row, "NAMA_AM") || getFieldValue(row, "nama_am")}</span>
        </div>
      ),
    },
    { key: "TR", label: "REGION", render: (row) => getFieldValue(row, "TR") || getFieldValue(row, "tr") },
    // DIUBAH: Kolom 'WITEL' diganti 'STATUS AM'
    { key: "LEVEL_AM", label: "STATUS AM", render: (row) => getFieldValue(row, "level_am") || getFieldValue(row, "LEVEL_AM") },
  ];

  // Hitung hanya AM yang aktif
  const activeFilteredCount = filtered.filter((r) => {
    const val =
      getFieldValue(r, "AM_AKTIF_POSISI_OKTOBER_2025") ??
      getFieldValue(r, "am_aktif_posisi_oktober_2025") ??
      getFieldValue(r, "AM_AKTIF") ??
      getFieldValue(r, "am_aktif");

    if (val === undefined || val === null) return false;
    const s = String(val).trim().toLowerCase();
    return ["y", "yes", "1", "true", "active", "aktif", "ya"].includes(s);
  }).length;

  // Stats
  const stats = [
    // DIUBAH: Urutan dan item di dalam stats
    { label: "Jumlah AM", value: filtered.length.toLocaleString(), icon: FaUsers },
    { label: "Total Active AM", value: activeFilteredCount.toLocaleString(), icon: FaUserTie },
    { label: "Regions", value: regions.length.toString(), icon: FaMapMarkerAlt },
  ];

  // ... (useEffect untuk popover, handlePopoverEnter, handlePopoverLeave, calcPopoverStyle, popStyle, formatDateMaybe) ...
  // (Tidak ada perubahan di bagian ini, jadi saya singkat)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let tableEl = wrapper.querySelector("table");
    let obs = null;
    let cleanupTableListeners = null;
    const attachListeners = (table) => {
      const tbody = table.querySelector("tbody");
      if (!tbody) return () => {};
      const onMouseMove = (ev) => {
        setHoverPos({ x: ev.clientX, y: ev.clientY });
        const tr = ev.target.closest("tr");
        if (!tr || tr.closest("thead")) return;
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const idx = rows.indexOf(tr);
        if (idx === -1) return;
        const rowData = pageRows[idx];
        if (!rowData) return;
        if (clearTimeoutRef.current) {
          clearTimeout(clearTimeoutRef.current);
          clearTimeoutRef.current = null;
        }
        setHoveredRow(rowData);
      };
      const onMouseOut = () => {
        if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = setTimeout(() => {
          if (!popoverKeep) setHoveredRow(null);
        }, 120);
      };
      tbody.addEventListener("mousemove", onMouseMove);
      tbody.addEventListener("mouseout", onMouseOut);
      return () => {
        tbody.removeEventListener("mousemove", onMouseMove);
        tbody.removeEventListener("mouseout", onMouseOut);
      };
    };
    if (tableEl) {
      cleanupTableListeners = attachListeners(tableEl);
    } else {
      obs = new MutationObserver(() => {
        tableEl = wrapper.querySelector("table");
        if (tableEl) {
          if (obs) {
            obs.disconnect();
            obs = null;
          }
          cleanupTableListeners = attachListeners(tableEl);
        }
      });
      obs.observe(wrapper, { childList: true, subtree: true });
    }
    return () => {
      if (cleanupTableListeners) cleanupTableListeners();
      if (obs) {
        obs.disconnect();
        obs = null;
      }
      if (clearTimeoutRef.current) {
        clearTimeoutRef.current = null;
      }
    };
  }, [pageRows, popoverKeep]);
  const handlePopoverEnter = () => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    setPopoverKeep(true);
  };
  const handlePopoverLeave = () => {
    setPopoverKeep(false);
    if (clearTimeoutRef.current) {
      clearTimeoutRef.current = null;
    }
    clearTimeoutRef.current = setTimeout(() => {
      if (!popoverKeep) setHoveredRow(null);
    }, 80);
  };
  const POP_WIDTH = 300;
  const OFFSET_X = 16;
  const OFFSET_Y = 6;
  const MIN_MARGIN = 8;
  const calcPopoverStyle = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const movingDown = hoverPos.y > prevYRef.current;
    prevYRef.current = hoverPos.y;
    const actualHeight = popRef.current?.getBoundingClientRect().height ?? 220;
    let left = Math.round(hoverPos.x + OFFSET_X);
    if (left + POP_WIDTH + MIN_MARGIN > vw) {
      left = Math.max(MIN_MARGIN, vw - POP_WIDTH - MIN_MARGIN);
    }
    let top;
    if (movingDown) {
      top = Math.round(hoverPos.y - OFFSET_Y - actualHeight);
    } else {
      top = Math.round(hoverPos.y + OFFSET_Y);
    }
    if (top < MIN_MARGIN) top = MIN_MARGIN;
    if (top + actualHeight > vh - MIN_MARGIN) {
      top = Math.max(MIN_MARGIN, vh - actualHeight - MIN_MARGIN);
    }
    return { top, left };
  };
  const popStyle = calcPopoverStyle();
  const formatDateMaybe = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d)) return String(val);
    return d.toLocaleDateString();
  };

  // ----------------- Export functionality (filtered -> XLSX) -----------------
  const EXPORT_FIELDS = [
    { key: "id_sales", label: "ID SALES" },
    { key: "nik_am", label: "NIK AM" },
    { key: "nama_am", label: "NAMA AM" },
    { key: "tr", label: "Region" },
    // DIHAPUS: 'witel' dihapus
    // popover fields (level_am sudah ada di sini)
    ...POPOVER_FIELDS,
    // active flag
    { key: "am_aktif_posisi_oktober_2025", label: "AM Aktif" },
  ];

  const handleExport = async () => {
    const rowsToExport = filtered;
    if (!rowsToExport || rowsToExport.length === 0) {
      alert("Tidak ada data untuk diexport (cek filter).");
      return;
    }

    const XLSX = await import("xlsx");

    const sheetData = rowsToExport.map((r) => {
      const obj = {};
      EXPORT_FIELDS.forEach((f) => {
        const raw = getFieldValue(r, f.key);
        obj[f.label] = raw === null || raw === undefined ? "" : raw;
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AM Export");

    const filenameParts = ["am-profile-export"];
    if (filter.region) filenameParts.push(`region-${filter.region}`);
    // DIUBAH: 'witel' diganti 'levelAm', dan 'status' diberi label lebih jelas
    if (filter.levelAm) filenameParts.push(`status-am-${filter.levelAm}`);
    if (filter.status) filenameParts.push(`status-aktif-${filter.status}`);
    filenameParts.push(new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-"));
    const filename = `${filenameParts.join("_")}.xlsx`;

    XLSX.writeFile(wb, filename);
  };
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        variant="hero"
        title="Account Manager Profile"
        subtitle="Lihat profil dan detail Account Manager di seluruh region"
        icon={FaUserTie}
      />

      {/* Stats */}
      {/* DIUBAH: Grid cols disesuaikan, stats.map otomatis update */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <StatsCard {...s} />
          </div>
        ))}
      </div>

      {/* Filter */}
      <Card className="bg-white">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-neutral-700">
            <FaFilter className="text-[#E60012]" />
            <h2 className="font-semibold">Filter Data</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <SearchInput
              value={filter.q}
              onChange={(v) => setFilter((s) => ({ ...s, q: v }))}
              placeholder="Search ID, NIK or Name..."
            />

            <Select
              value={filter.region}
              // DIPERBAIKI: Typo e.targe -> e.target (sudah saya perbaiki di turn sebelumnya)
              onChange={(e) => setFilter((s) => ({ ...s, region: e.target.value }))}
            >
              <option value="">All Regions</option>
              <option value={NO_REGION_VALUE}>Tidak Ada Regions</option>
              {regions.length === 0 ? (
                <option value="" disabled>
                  — No Regions Found —
                </option>
              ) : (
                regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))
              )}
            </Select>

            {/* DIUBAH: Filter 'Witel' diganti 'Status AM' */}
            <Select
              value={filter.levelAm}
              onChange={(e) => setFilter((s) => ({ ...s, levelAm: e.target.value }))}
            >
              <option value="">All Kel AM</option> {AM_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>

            {/* Dropdown filter: Status Aktif/Non-Aktif */}
            <Select
              value={filter.status}
              onChange={(e) => setFilter((s) => ({ ...s, status: e.target.value }))}
            >
              {/* DIUBAH: Label diperjelas */}
              <option value="">All Status (Aktif/Non)</option>
              <option value="aktif">Aktif</option>
              <option value="non_aktif">Non Aktif</option>
            </Select>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">
              Showing <span className="font-semibold text-neutral-700">{filtered.length}</span> of{" "}
              <span className="font-semibold text-neutral-700">{ams.length}</span> account managers
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="inline-flex items-center gap-2 text-sm hover:text-[#7C3AED]" onClick={handleExport}>
                <FaDownload />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading data...</p>
        ) : (
          <div ref={wrapperRef} className="relative">
            <Table columns={columns} data={pageRows} rowKey={(r) => getFieldValue(r, "ID_SALES") || getFieldValue(r, "id_sales")} />
          </div>
        )}
      </div>

      {/* Popover */}
      {hoveredRow && (
        <div
          ref={popRef}
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handlePopoverLeave}
          className="z-50 bg-white shadow-xl border border-gray-200 rounded-lg p-3 text-sm text-gray-700 transition-opacity duration-75"
          style={{
            position: "fixed",
            width: POP_WIDTH,
            top: popStyle.top,
            left: popStyle.left,
            maxHeight: "50vh",
            overflow: "auto",
            pointerEvents: "auto",
          }}
        >
          <div className="font-semibold mb-2 text-gray-800">Detail Data</div>
          <div className="space-y-1">
            {POPOVER_FIELDS.map(({ key, label }) => {
              const raw = getFieldValue(hoveredRow, key) ?? "";
              const displayDateKeys = ["tgl_aktif", "tgl_akhir_kontrak_pro_hire", "tgl_out_sebagai_am"];
              const display = displayDateKeys.includes(key) ? formatDateMaybe(raw) : (raw === "" || raw === null ? "-" : String(raw));
              return (
                <div key={key} className="flex justify-between gap-3">
                  <div className="text-gray-500 truncate pr-2">{label}</div>
                  <div className="text-gray-800 font-medium text-right truncate max-w-[160px]">{display}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      <Card className="bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-neutral-600">
            <span className="text-neutral-800 font-semibold">{total === 0 ? 0 : startIndex + 1}-{endIndex}</span>
            <span> dari {total} Account Manager</span>
          </div>

          <Pagination
            page={page}
            onPrev={onPrev}
            onNext={onNext}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n);
              setPage(1);
            }}
          />
        </div>
      </Card>
    </div>
  );
}