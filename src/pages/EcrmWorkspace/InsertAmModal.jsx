// src/pages/EcrmWorkspace/InsertAmModal.jsx

import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Button from "../../components/ui/Button"; 

// --- FormInput dimodifikasi untuk mendukung <select> ---
function FormInput({ label, id, value, onChange, type = "text", options = [] }) {
  const commonProps = {
    id,
    name: id,
    value: value,
    onChange: onChange,
    className: "w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-sm",
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
      </label>
      {type === "select" ? (
        <select {...commonProps}>
          <option value="">-- Pilih {label} --</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  );
}

const MODAL_FIELDS = [
  { key: "notel", label: "No. Telp", type: "tel" },
  { key: "email", label: "Email", type: "email" },
  { key: "level_am", label: "Level AM" },
  { 
    key: "kel_am", 
    label: "Kel AM", 
    type: "select", 
    options: [
      "AM Pro Hire MD",
      "AM Organik",
      "AM Organik MD",
      "AM Pro Hire",
      "AM SME",
    ]
  },
  { key: "tgl_aktif", label: "Tgl Aktif", type: "date" },
  { key: "update_perpanjangan_kontrak", label: "Update Perpanjangan Kontrak" },
  { key: "lama_menjadi_pro_hire", label: "Lama Menjadi Pro Hire" },
  { key: "ket_out", label: "Keterangan Out", type: "textarea" },
  // "Tgl Akhir Kontrak Pro Hire" dan "Tgl Out Sebagai AM" telah dihapus
];


export default function InsertAmModal({ isOpen, onClose }) { // <-- Prop 'fields' dihapus
  // Buat state awal untuk form dari MODAL_FIELDS
  const initialFormState = MODAL_FIELDS.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialFormState);

  // Reset form setiap kali modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- SIMULASI PENGIRIMAN DATA UNTUK VALIDASI ---
    console.log("Data yang akan dikirim untuk validasi:", formData);
    
    // Tampilkan notifikasi (placeholder) sesuai permintaan
    alert("Permintaan Insert AM telah dikirim dan menunggu validasi Manajer/Admin.");
    onClose();
  };

  // Jangan render apapun jika modal tidak terbuka
  if (!isOpen) {
    return null;
  }

  return (
    // Overlay (latar belakang)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose} // Klik di luar modal akan menutupnya
    >
      {/* Konten Modal */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat diklik di dalam
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-800">Insert Account Manager Baru</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-neutral-600 mb-4">
            Isi data AM baru di bawah ini. Data akan dikirim untuk proses validasi dan approval
            oleh Manajer atau Admin sebelum aktif di sistem.
          </p>
          
          {/* Render form fields secara dinamis dari MODAL_FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODAL_FIELDS.map((field) => (
              <FormInput
                key={field.key}
                id={field.key}
                label={field.label}
                value={formData[field.key]}
                onChange={handleChange}
                type={field.type || 'text'} // Ambil tipe dari objek, default 'text'
                options={field.options} // Ambil options dari objek (untuk select)
              />
            ))}
          </div>

          {/* Footer Modal (Tombol Aksi) */}
          <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-neutral-200">
            <Button variant="ghost" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Kirim untuk Validasi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}