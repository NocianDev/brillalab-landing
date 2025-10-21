// src/components/BrillaLabLanding.jsx
import React, { useEffect, useState, useCallback } from "react";
import { insertContact } from "../supabaseClient.js"; // ruta desde components -> src/supabaseClient.js

export default function BrillaLabLanding() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [queuedCount, setQueuedCount] = useState(0);

  // ----- IndexedDB helpers -----
  function openIDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("brillalab_db_v1", 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("contacts")) {
          db.createObjectStore("contacts", { keyPath: "id", autoIncrement: true });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => reject(req.error);
    });
  }

  function saveToIDB(contact) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await openIDB();
        const tx = db.transaction("contacts", "readwrite");
        const store = tx.objectStore("contacts");
        const req = store.add({ ...contact, created_at: new Date().toISOString() });
        req.onsuccess = () => {
          resolve(req.result);
          db.close();
        };
        req.onerror = () => {
          reject(req.error);
          db.close();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  function getAllFromIDB() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await openIDB();
        const tx = db.transaction("contacts", "readonly");
        const store = tx.objectStore("contacts");
        const req = store.getAll();
        req.onsuccess = () => {
          resolve(req.result || []);
          db.close();
        };
        req.onerror = () => {
          reject(req.error);
          db.close();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  function deleteFromIDB(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await openIDB();
        const tx = db.transaction("contacts", "readwrite");
        const store = tx.objectStore("contacts");
        const req = store.delete(id);
        req.onsuccess = () => {
          resolve(true);
          db.close();
        };
        req.onerror = () => {
          reject(req.error);
          db.close();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  async function refreshQueuedCount() {
    try {
      const all = await getAllFromIDB();
      setQueuedCount(all.length);
    } catch {
      setQueuedCount(0);
    }
  }

  // ----- Supabase send -----
  async function sendToSupabase(payload) {
    return await insertContact(payload);
  }

  // ----- flush queued contacts when online -----
  const flushQueuedContacts = useCallback(async () => {
    try {
      const queued = await getAllFromIDB();
      if (!queued || queued.length === 0) {
        setQueuedCount(0);
        return;
      }

      for (const item of queued) {
        try {
          console.log("Intentando enviar queued item a Supabase:", item);
          await sendToSupabase({
            name: item.name,
            email: item.email,
            message: item.message,
          });
          await deleteFromIDB(item.id);
          console.log("Queued item enviado y eliminado del IDB:", item.id);
        } catch (err) {
          console.warn("No se pudo enviar queued item a Supabase:", err);
          // Si falla uno, detenemos aquí para reintentar más tarde.
          break;
        }
      }
    } catch (err) {
      console.error("flushQueuedContacts error:", err);
    } finally {
      await refreshQueuedCount();
    }
  }, []);

  useEffect(() => {
    refreshQueuedCount();
    if (navigator.onLine) flushQueuedContacts();
    function onOnline() {
      flushQueuedContacts();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushQueuedContacts]);

  // ----- form handling -----
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg("Por favor completa nombre y correo.");
      return;
    }
    if (!validateEmail(form.email)) {
      setErrorMsg("Por favor ingresa un correo válido.");
      return;
    }

    setSending(true);
    const payload = { name: form.name.trim(), email: form.email.trim(), message: form.message.trim() };

    if (!navigator.onLine) {
      // OFFLINE: guarda en IndexedDB
      try {
        await saveToIDB(payload);
        setForm({ name: "", email: "", message: "" });
        setSent(true);
        setTimeout(() => setSent(false), 3000);
        setErrorMsg(null);
        console.log("Guardado localmente (offline).");
      } catch (err) {
        console.error("Error guardando en IDB:", err);
        setErrorMsg("Error guardando localmente.");
      } finally {
        await refreshQueuedCount();
        setSending(false);
      }
      return;
    }

    // ONLINE: intenta enviar a Supabase; si falla, guarda en IDB
    try {
      console.log("Enviando a Supabase...", payload);
      const res = await sendToSupabase(payload);
      console.log("Supabase respuesta:", res);
      setForm({ name: "", email: "", message: "" });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setErrorMsg(null);
    } catch (err) {
      console.warn("Enviar a Supabase falló, guardando localmente:", err);
      const friendly = err?.message || "Error al enviar";
      try {
        await saveToIDB(payload);
        setForm({ name: "", email: "", message: "" });
        setSent(true);
        setErrorMsg(`No se pudo conectar a Supabase; datos guardados localmente. (${friendly})`);
      } catch (idbErr) {
        console.error("Error saving to IDB after supabase fail:", idbErr);
        setErrorMsg("Error al guardar el contacto.");
      }
    } finally {
      setSending(false);
      await refreshQueuedCount();
    }
  }

  // Export queued entries as JSON file
  async function handleExport() {
    try {
      const all = await getAllFromIDB();
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brillalab-contacts-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("No se pudo exportar.");
    }
  }

  // ----- UI -----
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-yellow-50 text-slate-900 antialiased">
      <header className="sticky top-0 z-40 backdrop-blur-sm bg-white/60 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" fill="white" />
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-none">BrillaLab</h1>
              <p className="text-xs -mt-0.5 text-slate-600">Diseño digital & soluciones creativas</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Conexión: {navigator.onLine ? <span className="text-green-600">Online</span> : <span className="text-red-600">Offline</span>}
            </div>
            <button onClick={handleExport} className="text-sm px-3 py-2 rounded bg-white shadow">
              Exportar guardados ({queuedCount})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <section id="contact" className="mt-6 mb-12 grid md:grid-cols-2 gap-8 items-start">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-100 to-purple-100 shadow">
            <h3 className="text-2xl font-extrabold">Hablemos de tu proyecto</h3>
            <p className="mt-2 text-slate-700">Cuéntanos tu idea y armamos un plan con estética y resultados.</p>

            <div className="mt-6">
              <h4 className="font-semibold">Dirección</h4>
              <p className="text-sm text-slate-600">Monterrey, México</p>

              <h4 className="mt-4 font-semibold">Correo</h4>
              <p className="text-sm text-slate-600">angeldevsweb@gmail.com</p>

              <p className="mt-4 text-xs text-slate-500">Si estás offline, los mensajes se guardan en tu navegador y se enviarán automáticamente cuando vuelvas a conectarte.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white shadow">
            <h4 className="font-bold text-lg">Escríbenos</h4>
            <p className="text-sm text-slate-600">Responderemos pronto.</p>

            <label className="block mt-4 text-sm">Nombre</label>
            <input name="name" value={form.name} onChange={handleChange} required className="mt-1 w-full p-3 rounded-md border" placeholder="Tu nombre" />

            <label className="block mt-4 text-sm">Correo</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1 w-full p-3 rounded-md border" placeholder="correo@ejemplo.com" />

            <label className="block mt-4 text-sm">Mensaje</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={4} className="mt-1 w-full p-3 rounded-md border" placeholder="Cuéntanos sobre tu proyecto"></textarea>

            {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}

            <div className="mt-6 flex items-center gap-4">
              <button type="submit" disabled={sending} className={`px-5 py-3 rounded-lg text-white font-semibold shadow ${sending ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-pink-500 to-yellow-400"}`}>
                {sending ? "Enviando..." : "Enviar"}
              </button>
              {sent && <span className="text-sm text-green-600">¡Mensaje guardado/enviado!</span>}
              <span className="ml-4 text-sm text-slate-500">En cola: {queuedCount}</span>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
