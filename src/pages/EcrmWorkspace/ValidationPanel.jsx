// src/pages/ValidationPanel.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchATM,
  fetchCA,
  fetchTEMP,
  fetchLOG,
  runValidateAM,
  generateCommit,
  diffCAtoATM,
} from "../../services/validation";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Tabs } from "../../components/ui/Tabs";
import { FaArrowLeft } from "react-icons/fa";
import FlowSteps from "../../components/validation/FlowSteps";
import Card from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/Progress";
import UiToolbar from "../../components/ui/Toolbar";
import DataTableWithPagination from "../../components/ui/DataTableWithPagination";

export default function ValidationPanel() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("ATM");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [atm, setAtm] = useState([]);
  const [ca, setCa] = useState([]);
  const [temp, setTemp] = useState([]);
  const [log, setLog] = useState([]);

  const [state, setState] = useState("idle");
  const [selectedTemp, setSelectedTemp] = useState(() => new Set());

  const getKey = (row) => {
    const nik = row?.nik_am?.trim?.();
    const id = row?.id_sales?.toString?.().trim?.();
    if (nik) return `nik:${nik}`;
    if (id) return `id:${id}`;
    if (row?.ts) return `ts:${row.ts}`;
    if (row?.nama_am) return `nm:${row.nama_am}`;
    return undefined;
  };

  const toggleTempSelected = (row) => {
    const k = getKey(row);
    if (!k) return;
    setSelectedTemp((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const selectAllOnPage = (rows) => {
    setSelectedTemp((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => {
        const k = getKey(r);
        if (k) next.add(k);
      });
      return next;
    });
  };

  const deselectAllOnPage = (rows) => {
    setSelectedTemp((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => {
        const k = getKey(r);
        if (k) next.delete(k);
      });
      return next;
    });
  };

  // initial load: ATM, CA, TEMP, LOG
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [atmData, caData, tempData, logData] = await Promise.all([
          fetchATM(),
          fetchCA(),
          fetchTEMP(),
          fetchLOG(),
        ]);
        if (!mounted) return;
        setAtm(Array.isArray(atmData) ? atmData : []);
        setCa(Array.isArray(caData) ? caData : []);
        setTemp(Array.isArray(tempData) ? tempData : []);
        setLog(Array.isArray(logData) ? logData : []);
      } catch (err) {
        console.error("Initial load error:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // helper to refresh TEMP & LOG (callable from actions)
  const refreshTempAndLog = useCallback(async () => {
    try {
      const [t, l] = await Promise.all([fetchTEMP(), fetchLOG()]);
      setTemp(Array.isArray(t) ? t : []);
      setLog(Array.isArray(l) ? l : []);
    } catch (e) {
      console.error("refreshTempAndLog error", e);
    }
  }, []);

  // run validation (still calls backend import then refresh temp/log)
  const handleValidateAM = useCallback(async () => {
    setState("validating");
    try {
      const res = await runValidateAM("manager");
      if (res && Array.isArray(res.temp)) {
        setTemp(res.temp);
      } else {
        await refreshTempAndLog();
      }
      if (res?.log) {
        setLog((prev) => (res.log ? [res.log, ...prev] : prev));
      }
      setSelectedTemp(new Set());
      setActiveTab("TEMP");
      setState("success");
    } catch (err) {
      console.error("handleValidateAM error", err);
      setState("error");
    }
  }, [refreshTempAndLog]);

  // commit selected TEMP rows
  const handleGenerate = useCallback(
    async (user = "manager") => {
      setState("validating");
      try {
        const toInsert = temp.filter((t) => {
          const k = getKey(t);
          return k && selectedTemp.has(k);
        });
        if (toInsert.length === 0) {
          setState("idle");
          return;
        }
        const ids = toInsert.map((r) => r.id_sales ?? r.ID_SALES ?? r.nik_am ?? r.NIK_AM).filter(Boolean);
        const commitRes = await generateCommit(user, ids);
        // refresh ATM, TEMP, LOG
        const atmData = await fetchATM();
        setAtm(Array.isArray(atmData) ? atmData : atm);
        await refreshTempAndLog();
        setSelectedTemp(new Set());
        if (commitRes?.entry) setLog((prev) => [commitRes.entry, ...prev]);
        setActiveTab("ATM");
        setState("success");
      } catch (err) {
        console.error("handleGenerate error", err);
        setState("error");
      }
    },
    [temp, selectedTemp, refreshTempAndLog, atm]
  );

  // scoped lists
  const tempScoped = useMemo(() => {
    if (!filter) return temp;
    const q = filter.toLowerCase();
    return temp.filter(
      (t) =>
        (t.nik_am || "").toLowerCase().includes(q) ||
        (t.id_sales || "").toString().toLowerCase().includes(q) ||
        (t.nama_am || "").toLowerCase().includes(q)
    );
  }, [temp, filter]);

  const atmScoped = useMemo(() => {
    if (!filter) return atm;
    const q = filter.toLowerCase();
    return atm.filter(
      (t) =>
        (t.nik_am || t.NIK_AM || "").toString().toLowerCase().includes(q) ||
        (t.id_sales || t.ID_SALES || "").toString().toLowerCase().includes(q) ||
        (t.nama_am || t.NAMA_AM || "").toString().toLowerCase().includes(q)
    );
  }, [atm, filter]);

  const caScoped = useMemo(() => {
    if (!filter) return ca;
    const q = filter.toLowerCase();
    return ca.filter(
      (t) =>
        (t.nik_am || "").toLowerCase().includes(q) ||
        (t.id_sales || "").toLowerCase().includes(q) ||
        (t.nama_am || "").toLowerCase().includes(q)
    );
  }, [ca, filter]);

  const logScoped = useMemo(() => {
    if (!filter) return log;
    const q = filter.toLowerCase();
    return log.filter(
      (t) =>
        ((t.log_user || t.LOG_USER || "") + " " + (t.actor || "") + " " + (t.action || "")).toLowerCase().includes(q)
    );
  }, [log, filter]);

  // progress
  const comparison = useMemo(() => diffCAtoATM(ca, atm), [ca, atm]);
  const totalCA = ca.length;
  const validCount = comparison.valid.length;
  const pct = totalCA ? Math.round((validCount / totalCA) * 100) : 0;

  // CTA logic
  const hasTemp = temp.length > 0;
  const selectedCount = useMemo(() => selectedTemp.size, [selectedTemp]);
  const cta = useMemo(() => {
    if (!hasTemp) {
      return {
        label: "Compare CA→ATM & Save to TEMP",
        onClick: handleValidateAM,
        variant: "primary",
      };
    }
    return {
      label: selectedCount > 0 ? `Save ${selectedCount} to AM Master` : "Select rows to save",
      onClick: selectedCount > 0 ? () => handleGenerate("manager") : undefined,
      disabled: selectedCount === 0,
      variant: selectedCount > 0 ? "secondary" : "ghost",
    };
  }, [hasTemp, selectedCount, handleValidateAM, handleGenerate]);

  // columns definitions (adjusted for DB fields)
  const atmCols = [
    { key: "nik_am", label: "NIK", sortable: true },
    { key: "id_sales", label: "ID Sales", sortable: true },
    { key: "nama_am", label: "Nama", sortable: true },
    { key: "region", label: "Region" },
    { key: "witel", label: "Witel" },
  ];

  const caCols = [
    { key: "nik_am", label: "NIK", sortable: true },
    { key: "nama_am", label: "Nama", sortable: true },
    { key: "region", label: "Region" },
    { key: "witel", label: "Witel" },
    { key: "created_at", label: "Created At" },
  ];

  // TEMP: columns to match your temp_profeling table (STATUS_APPROVED)
  const tempCols = [
    { key: "__select__", label: "", className: "w-10" },
    { key: "nik_am", label: "NIK", sortable: true },
    { key: "id_sales", label: "ID Sales", sortable: true },
    { key: "nama_am", label: "Nama", sortable: true },
    { key: "region", label: "Region" },
    { key: "witel", label: "Witel" },
    { key: "status_approved", label: "Status Approved" },
    { key: "created_at", label: "Created At" },
  ];

   //LOG columns
  const logCols = [
    { key: "id_sales", label: "ID SALES" },
    { key: "nik_am", label: "NIK" },
    { key: "nama_am", label: "NAMA" },
    { key: "region", label: "REGION" },
    { key: "witel", label: "WITEL" },
    { key: "log_user", label: "Log User" },
    { key: "work_log", label: "Work Log" },
  ];

  const renderTempCell = (row, key) => {
    if (key === "__select__") {
      const k = getKey(row);
      const checked = k ? selectedTemp.has(k) : false;
      return <input type="checkbox" disabled={!k} checked={checked} onChange={() => toggleTempSelected(row)} />;
    }
    if (key === "status_approved") {
      return <Badge variant={row.status_approved === "APPROVED" ? "success" : "neutral"}>{row.status_approved ?? "-"}</Badge>;
    }
    return row[key] ?? row?.raw?.[key] ?? "-";
  };

  const tabData = activeTab === "ATM" ? atmScoped : activeTab === "CA" ? caScoped : activeTab === "TEMP" ? tempScoped : logScoped;
  const columns = activeTab === "ATM" ? atmCols : activeTab === "CA" ? caCols : activeTab === "TEMP" ? tempCols : logCols;

  const total = tabData.length;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, total);
  const pageRows = tabData.slice(startIndex, endIndex);

  const allSelectedOnPage = useMemo(() => {
    if (activeTab !== "TEMP") return false;
    return pageRows.length > 0 && pageRows.every((r) => selectedTemp.has(getKey(r)));
  }, [activeTab, pageRows, selectedTemp]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, filter, rowsPerPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        variant="hero"
        title="Validation"
        subtitle="Bandingkan data CA dengan AM (ATM), pilih data yang belum ada, simpan ke TEMP, lalu generate ke AM Master"
        right={
          <Button variant="back" className="inline-flex items-center gap-2" onClick={() => navigate("/ecrm-workspace")}>
            <FaArrowLeft />
            Back to Workspace
          </Button>
        }
      />

      <FlowSteps current={activeTab === "ATM" ? 1 : activeTab === "CA" ? 2 : activeTab === "TEMP" ? 3 : 4} />

      <Card className="bg-gradient-to-br from-white to-[#F5F6FA]">
        <UiToolbar className="justify-between">
          <div className="flex items-center gap-2">
            {cta && (
              <Button variant={cta.variant || "primary"} onClick={cta.onClick} disabled={state === "validating" || cta.disabled} className="inline-flex items-center gap-2">
                {cta.label}
              </Button>
            )}
          </div>

          <div className="min-w-[280px]">
            <div className="text-xs text-neutral-500 mb-1">Progress CA in ATM: {pct}%</div>
            <ProgressBar value={pct} size="lg" />
          </div>
        </UiToolbar>
      </Card>

      <Tabs
        tabs={[
          { key: "ATM", label: "ATM" },
          { key: "CA", label: "CA" },
          { key: "TEMP", label: "TEMP" },
          { key: "LOG", label: "LOG" },
        ]}
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k)}
      />

      <DataTableWithPagination
        columns={columns}
        data={tabData}
        rowKey={(row) => getKey(row) || row.nik_am || row.id_sales}
        renderCell={activeTab === "TEMP" ? renderTempCell : undefined}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        searchValue={filter}
        onSearchChange={setFilter}
        searchPlaceholder={activeTab === "TEMP" ? "Cari di TEMP" : activeTab === "CA" ? "Cari di CA" : activeTab === "ATM" ? "Cari di ATM" : "Cari log"}
        headerRight={
          activeTab === "TEMP" ? (
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => (allSelectedOnPage ? deselectAllOnPage(pageRows) : selectAllOnPage(pageRows))}>
                {allSelectedOnPage ? "Clear page" : "Select page"}
              </Button>
              <div className="text-xs text-neutral-500">Selected: {selectedTemp.size}</div>
            </div>
          ) : null
        }
      />
    </div>
  );
}
