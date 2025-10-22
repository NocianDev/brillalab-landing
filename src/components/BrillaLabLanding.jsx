// src/components/BrillaLabLanding.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BrillaLabLanding() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // ================== CONFIG PORTAFOLIO ==================
  // Ruta por defecto de la imagen (coloca la imagen en public/images/...)
  const portfolioDefaultImage = "/images/Site_1.png"; // <-- cambia aquí si quieres
  // URL por defecto a la que apuntan las tarjetas
  const portfolioDefaultUrl = "https://bright-spark-three.vercel.app/"; // <-- cambia aquí si quieres

  // Lista de items del portafolio. Por defecto se generan 6 cards que usan
  // la imagen/URL por defecto, pero puedes editar cada objeto para apuntar
  // a una imagen o URL distinta en el futuro.
  // Ejemplo de entrada personalizada:
  // { id: 1, title: 'Proyecto A', image: '/images/proyecto-a.jpg', url: 'https://proyecto-a.com' }
  const portfolioItems = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Proyecto ${i + 1}`,
    // Al inicio todas usan la misma imagen y URL; cámbialas individualmente cuando quieras.
    image: portfolioDefaultImage,
    url: portfolioDefaultUrl,
  }));
  // ======================================================

  // Contact links (configura si quieres)
  const phoneE164 = "528261271886";
  const defaultWaMessage = "¡Hola! Estoy interesado en tus servicios.\n¿Podrías darme más información?";
  const waLink = `https://wa.me/${phoneE164}?text=${encodeURIComponent(defaultWaMessage)}`;
  const mailAddress = "angeldevsweb@gmail.com";
  const mailSubject = "Contacto desde sitio — BrillaLab";
  const mailBodyExample = "Hola, me interesa recibir información sobre...";
  const mailLink = `mailto:${mailAddress}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBodyExample)}`;

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
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim() || null,
      };

      const { data, error } = await supabase.from("contacts").insert([payload]);
      if (error) {
        console.error("Supabase insert error:", error);
        setErrorMsg(error.message || "Error al enviar el formulario");
        setSending(false);
        return;
      }

      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudo conectar con Supabase. Revisa la consola.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-yellow-50 text-slate-900 antialiased">
      <header className="sticky top-0 z-40 backdrop-blur-sm bg-white/60 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" fill="white" />
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-none">BrillaLab</h1>
              <p className="text-xs -mt-0.5 text-slate-600">Diseño digital & soluciones creativas</p>
            </div>
          </a>

          <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
            <a href="#features" className="hover:underline">Servicios</a>
            <a href="#work" className="hover:underline">Portafolio</a>
            <a href="#pricing" className="hover:underline">Precios</a>
            <a href="#contact" className="hover:underline">Contacto</a>
            <button className="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white shadow">Empezar</button>
          </nav>

          <div className="md:hidden">
            <button aria-label="menu" className="p-2 rounded-md bg-white/80 shadow">☰</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* HERO */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">Nuevo · Lanzamiento</span>

            <h2 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">Colores que cuentan historias, experiencias que convierten.</h2>

            <p className="mt-4 text-slate-700 text-lg">En <strong>BrillaLab</strong> creamos páginas, marcas y productos digitales con identidad propia. Diseño vibrante, interacciones limpias y resultados medibles.</p>

            <div className="mt-6 flex gap-4">
              <a href="#contact" className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-semibold shadow-lg">Comenzar</a>
              <a href="#work" className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-pink-200 text-pink-600 font-semibold">Ver portafolio</a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/90 shadow">
                <p className="text-xs text-slate-500">Clientes felices</p>
                <p className="text-xl font-bold">120+</p>
              </div>
              <div className="p-4 rounded-xl bg-white/90 shadow">
                <p className="text-xs text-slate-500">Proyectos entregados</p>
                <p className="text-xl font-bold">85</p>
              </div>
              <div className="p-4 rounded-xl bg-white/90 shadow">
                <p className="text-xs text-slate-500">Premios creativos</p>
                <p className="text-xl font-bold">6</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-10 w-56 h-56 rounded-3xl bg-gradient-to-br from-yellow-300 to-pink-300 opacity-90 blur-3xl transform rotate-6"></div>
            <div className="absolute -right-12 bottom-6 w-44 h-44 rounded-2xl bg-gradient-to-br from-cyan-300 to-purple-400 opacity-90 blur-2xl transform rotate-12"></div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white">
              <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-200 text-slate-600">
                <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect width="160" height="100" rx="12" fill="white" />
                  <path d="M10 70 L40 30 L70 60 L100 20 L140 70" stroke="#c026d3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold">Campañas coloridas con estrategia</h3>
                <p className="mt-2 text-slate-600">Casos reales donde la estética y la conversión trabajan de la mano.</p>
                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">Ver estudio</button>
                  <button className="px-4 py-2 rounded-md border border-slate-200">Descargar</button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mt-16">
          <h3 className="text-2xl font-extrabold">Nuestros servicios</h3>
          <p className="mt-2 text-slate-600">Diseño, desarrollo y estrategia para proyectos que buscan destacar.</p>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Identidad de marca", desc: "Logos, paletas, y guías que cuentan tu historia.", icon: "🎨" },
              { title: "Web a medida", desc: "Landing pages y e-commerce optimizados para conversión.", icon: "💻" },
              { title: "Campañas creativas", desc: "Social ads y contenidos que conectan con tu audiencia.", icon: "📣" },
              { title: "Soporte & crecimiento", desc: "Estrategia de crecimiento y mantenimiento continuo.", icon: "🚀" },
            ].map((s) => (
              <article key={s.title} className="p-6 rounded-2xl bg-white shadow hover:scale-[1.02] transition-transform">
                <div className="text-3xl">{s.icon}</div>
                <h4 className="mt-4 font-semibold">{s.title}</h4>
                <p className="mt-2 text-slate-600 text-sm">{s.desc}</p>
                <a href="#contact" className="mt-4 inline-block text-sm font-semibold text-pink-600">Solicitar</a>
              </article>
            ))}
          </div>
        </section>

        {/* WORK / GALLERY */}
        <section id="work" className="mt-16">
          <h3 className="text-2xl font-extrabold">Portafolio</h3>
          <p className="mt-2 text-slate-600">Algunos proyectos destacados — color, propósito y resultado.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <a
                key={item.id}
                href={item.url || portfolioDefaultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition-shadow"
                aria-label={`Abrir ${item.title}`}
              >
                <div className="w-full h-44 relative bg-gray-100">
                  <img
                    src={item.image || portfolioDefaultImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>

                <div className="p-4">
                  <h5 className="font-semibold">{item.title}</h5>
                  <p className="text-sm text-slate-600 mt-2">Solución creativa y centrada en el usuario con enfoque en identidad y rendimiento.</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mt-16">
          <h3 className="text-2xl font-extrabold">Planes simples y claros</h3>
          <p className="mt-2 text-slate-600">Empieza con algo ligero y escala a medida que creces.</p>

          <div className="mt-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-white to-pink-50 shadow">
              <h4 className="font-bold text-xl">Starter</h4>
              <p className="mt-2 text-slate-600">Ideal para proyectos personales y pruebas de concepto.</p>
              <p className="mt-4 text-3xl font-extrabold">$199</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Landing page</li>
                <li>1 revisión</li>
                <li>Soporte por 2 semanas</li>
              </ul>
              <button className="mt-6 px-4 py-2 rounded-md bg-white border">Elegir</button>
            </div>

            <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
              <h4 className="font-bold text-xl">Pro</h4>
              <p className="mt-2">Para startups y negocios que buscan escalar.</p>
              <p className="mt-4 text-3xl font-extrabold">$899</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>Web completa</li>
                <li>3 revisiones</li>
                <li>Soporte por 2 meses</li>
              </ul>
              <button className="mt-6 px-4 py-2 rounded-md bg-white text-pink-600 font-bold">Contratar</button>
            </div>

            <div className="flex-1 p-6 rounded-2xl bg-white shadow">
              <h4 className="font-bold text-xl">Enterprise</h4>
              <p className="mt-2 text-slate-600">Soluciones a medida para equipos grandes.</p>
              <p className="mt-4 text-3xl font-extrabold">A medida</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Onboarding completo</li>
                <li>Revisiones ilimitadas</li>
                <li>Soporte prioritario</li>
              </ul>
              <button className="mt-6 px-4 py-2 rounded-md border">Contactar</button>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="mt-16 mb-12 grid md:grid-cols-2 gap-8 items-start">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-100 to-purple-100 shadow">
            <h3 className="text-2xl font-extrabold">Hablemos de tu proyecto</h3>
            <p className="mt-2 text-slate-700">Cuéntanos tu idea y armamos un plan con estética y resultados.</p>

            <div className="mt-6">
              <h4 className="font-semibold">Dirección</h4>
              <p className="text-sm text-slate-600">Monterrey, México</p>

              <h4 className="mt-4 font-semibold">Correo</h4>
              <a
                href={mailLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-slate-600 hover:underline transition-colors"
                aria-label="Enviar correo a BrillaLab"
              >
                {mailAddress}
              </a>

              <h4 className="mt-4 font-semibold">Teléfono</h4>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-slate-600 hover:underline transition-colors"
                aria-label="Abrir WhatsApp con BrillaLab"
              >
                +52 826 127 1886
              </a>

              <p className="mt-4 text-xs text-slate-500">Al hacer clic en el teléfono se abrirá WhatsApp (web o app). Al hacer clic en el correo se abrirá tu cliente de email.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white shadow">
            <h4 className="font-bold text-lg">Escríbenos</h4>
            <p className="text-sm text-slate-600">Responderemos en menos de 48 horas hábiles.</p>

            <label className="block mt-4 text-sm">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full p-3 rounded-md border"
              placeholder="Tu nombre"
            />

            <label className="block mt-4 text-sm">Correo</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full p-3 rounded-md border"
              placeholder="correo@ejemplo.com"
            />

            <label className="block mt-4 text-sm">Mensaje</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full p-3 rounded-md border"
              placeholder="Cuéntanos sobre tu proyecto"
            />

            {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}

            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={sending}
                className={`px-5 py-3 rounded-lg text-white font-semibold shadow ${
                  sending ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-pink-500 to-yellow-400"
                }`}
              >
                {sending ? "Enviando..." : "Enviar"}
              </button>
              {sent && <span className="text-sm text-green-600">¡Mensaje enviado!</span>}
            </div>
          </form>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 border-t pt-8 pb-6 text-sm text-slate-600">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6">
            <p>© {new Date().getFullYear()} BrillaLab. Diseñado con amor y colores.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline">Términos</a>
              <a href="#" className="hover:underline">Privacidad</a>
              <a href="#" className="hover:underline">Contacto</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
