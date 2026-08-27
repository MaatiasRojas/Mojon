import { useEffect, useRef, useState } from "react";
import { MapPin, Users, BedDouble, Flame, Wifi, Car, Menu, X, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./Mojon.css";
import HillDivider from "../HillDivider";
import CampoCasa from "../../../public/Casa 1.jpeg";
import Comedor1 from "../../../public/Comedor.jpeg";
import Comedor2 from "../../../public/Comedor 2.jpeg";
import Galeria from "../../../public/Galeria.jpeg";
import Habitacion1 from "../../../public/Habitacion 1.jpeg";
import Living from "../../../public/Living.jpeg";
import VideoRio from "../../../public/Video Rio.mp4";
import VideoRio2 from "../../../public/Video Rio 2.mp4";
// TODO: subí el video del dique a /public con este nombre (o cambiá el nombre acá).
import FotoDique from "../../../public/Foto Dique.jpg";

// Coordenadas reales (resueltas desde los links de Google Maps que pasaste).
const CASA_LAT = -28.6263484;
const CASA_LNG = -65.3568873;

// "Dique El Bolsón". Distancia calculada en línea recta (~7.9km) con un
// margen por curvas de ruta. Confirmá el tiempo real manejando una vez —
// esto es una estimación, no un dato medido.
const DIQUE_NOMBRE = "el Dique El Bolsón";
const DIQUE_DISTANCIA_KM = "10";
const DIQUE_DISTANCIA_MIN = "15";

/* ---------------------------------------------------------
Revela un elemento con fade + slide al entrar en viewport.
--------------------------------------------------------- */
function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(node);
        }
      },
      { threshold: 0.18 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`cdc-reveal ${visible ? "is-visible" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

function SectionLabel({ children }) {
  return <span className="cdc-section-label">{children}</span>;
}

function Casa() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="cdc-root">
      {/* ---------------- NAV ---------------- */}
      <nav className={`cdc-nav ${scrolled ? "is-scrolled" : ""}`}>
        <span className="cdc-nav-logo">El Mojón</span>

        <div className="cdc-nav-links">
          <button className="cdc-navlink" onClick={() => scrollTo("casa")}>
            La Casa
          </button>
          <button className="cdc-navlink" onClick={() => scrollTo("ubicacion")}>
            Ubicación
          </button>
          <button className="cdc-navlink" onClick={() => navigate("/disponibilidad")}>
            Disponibilidad
          </button>
        </div>

        <button
          className="cdc-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="cdc-mobile-menu">
          <button onClick={() => scrollTo("casa")}>La casa</button>
          <button onClick={() => scrollTo("ubicacion")}>Ubicación</button>
          <button onClick={() => navigate("/disponibilidad")}>Disponibilidad</button>
          <button onClick={() => navigate("/Admin")}>Calendario</button>
        </div>
      )}

      {/* ---------------- HERO ---------------- */}
      <header className="cdc-hero">
        <img
          src={CampoCasa}
          alt="Vista de campo abierto y sierras desde la casa"
          className="cdc-hero-img"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="cdc-hero-overlay" />
        <div className="cdc-hero-content">
          <Reveal as="h1" className="cdc-h1 cdc-hero-title">
            Un refugio a puro <em>horizonte</em>
          </Reveal>
          <Reveal as="p" className="cdc-hero-p">
            El Mojón abre sus puertas para vos: campo abierto, cielo despejado y el silencio que
            hace falta.
          </Reveal>
          <Reveal className="cdc-hero-actions">
            <button className="cdc-btn" onClick={() => scrollTo("casa")}>
              Conocer la casa
            </button>
            <button className="cdc-btn" onClick={() => navigate("/disponibilidad")}>
              ALQUILA AHORA!!
            </button>
            <div className="cdc-hero-stats">
              <span className="cdc-stat">
                <Users size={16} /> Hasta 8 personas
              </span>
              <span className="cdc-stat">
                <MapPin size={16} /> El Mojon, Catamarca
              </span>
            </div>
          </Reveal>
        </div>
      </header>

      <HillDivider from="#373f2e" to="#d4c498" />

      {/* ---------------- LA CASA ---------------- */}
      <section id="casa" className="cdc-section">
        <Reveal className="cdc-intro">
          <h2 className="cdc-h2 cdc-h2--lg">Cada ambiente mira al campo</h2>
          <p className="cdc-body">
            La casa se construyó pensando en el afuera: ventanales grandes, aberturas cruzadas y un
            deck que no separa el adentro del paisaje.
          </p>
        </Reveal>

        {/* fila 1: texto izq, foto der */}
        <div className="cdc-row">
          <Reveal>
            <span className="cdc-eyebrow-num">01 — LIVING</span>
            <h3 className="cdc-h3">Un solo espacio, abierto de punta a punta</h3>
            <p className="cdc-body">
              Living, comedor y cocina comparten un mismo salón con estufa a leña
              para las noches frescas. La mesa larga está pensada para compartir un asado,
              estan los ventanales para no perderse de los atardeceres.
            </p>
          </Reveal>
          <Reveal className="cdc-photo">
            <img src={Living} alt="Living con estufa a leña y ventanales al campo" />
          </Reveal>
        </div>

        {/* fila 2: foto izq, texto der */}
        <div className="cdc-row cdc-row--rev">
          <Reveal className="cdc-photo">
            <img src={Comedor1} alt="Comedor de la casa" />
          </Reveal>
          <Reveal>
            <span className="cdc-eyebrow-num">02 — COMEDOR</span>
            <h3 className="cdc-h3">Lugar para compartir de sobremesa</h3>
            <p className="cdc-body">
              El comedor conecta directo con la galería, así que las comidas pueden empezar adentro
              y terminar afuera sin que nadie se levante dos veces.
            </p>
            <div className="cdc-feature-list">
              <span className="cdc-stat">
                <Flame size={16} /> Parrilla
              </span>
              <span className="cdc-stat">
                <Car size={16} /> Estacionamiento
              </span>
              <span className="cdc-stat">
                <Wifi size={16} /> Wifi
              </span>
            </div>
          </Reveal>
        </div>

        {/* fila 3: texto izq, foto der */}
        <div className="cdc-row cdc-row--last">
          <Reveal>
            <span className="cdc-eyebrow-num">03 — HABITACIONES</span>
            <h3 className="cdc-h3">Dos habitaciones</h3>
            <p className="cdc-body">
              Dos habitaciones con matrimonial y una cama cucheta, hasta 8 personas
              cómodas. Todas dan al monte: el amanecer entra directo por la ventana.
              <br />
              -----------------------------------------------
              <br />
              Puede alquilar solo una habitacion si asi desea!!
            </p>
            <div className="cdc-feature-list">
              <span className="cdc-stat">
                <BedDouble size={16} /> 2 habitaciones
              </span>
            </div>
          </Reveal>
          <Reveal className="cdc-photo">
            <img src={Habitacion1} alt="Habitación con vista al monte serrano" />
          </Reveal>
        </div>

        <div className="cdc-booking-cta">
          <button
            className="cdc-btn cdc-btn--booking"
            type="button"
            onClick={() => navigate("/disponibilidad")}
          >
            ALQUILA AHORA!!
          </button>
        </div>

        {/* tira de fotos y videos adicionales */}
        <div className="cdc-media-section">
          <h3 className="cdc-h3">Algunas fotos y videos adicionales</h3>
          <div className="cdc-strip">
            {[
              { type: "video", src: VideoRio, poster: CampoCasa, alt: "Río cercano a la casa" },
              { type: "video", src: VideoRio2, poster: Galeria, alt: "Paisaje del río cercano" },
              { type: "image", src: CampoCasa, alt: "Casa de campo" },
              { type: "image", src: Galeria, alt: "Galería de la casa" },
              { type: "image", src: Comedor2, alt: "Comedor de la casa" },
            ].map((media, i) => (
              <div key={i} className="cdc-media-card">
                {media.type === "video" ? (
                  <video
                    className="cdc-media-content"
                    src={media.src}
                    poster={media.poster}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={media.alt}
                  />
                ) : (
                  <img className="cdc-media-content" src={media.src} alt={media.alt} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <HillDivider from="#d4c498" to="#333B29" flip />

      {/* ---------------- UBICACIÓN ---------------- */}
      <section id="ubicacion" className="cdc-section cdc-section--moss">
        <div className="cdc-location-row cdc-row">
          <Reveal>
            <SectionLabel>Ubicación</SectionLabel>
            <h2 className="cdc-h2 cdc-h2--md">A 30 minutos de la ciudad de Frias</h2>
            <p className="cdc-body" style={{ color: "#CFCABA", marginBottom: 26 }}>
              La casa está ubicada en El Mojon, con acceso por un camino bien mantenido. Se llega
              fácil, se sale despacio.
            </p>
            <ul className="cdc-location-list">
              <li>
                <MapPin size={17} color="#C9A24B" /> A 30 min de Frias
              </li>
              <li>
                <Car size={17} color="#C9A24B" /> Acceso por ruta y camino consolidado
              </li>
              <li>
                <Users size={17} color="#C9A24B" /> A 5/10 min del pueblo más cercano
              </li>
            </ul>
            <a
              className="cdc-btn cdc-btn--md"
              style={{ marginTop: 22, display: "inline-flex" }}
              href={`https://www.google.com/maps/dir/?api=1&destination=${CASA_LAT},${CASA_LNG}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation size={15} /> Cómo llegar
            </a>
          </Reveal>

          <Reveal className="cdc-map-wrap">
            {/* Embed de OpenStreetMap con la ubicación exacta de la casa. */}
            <iframe
              title="Ubicación de El Mojón"
              width="100%"
              height="100%"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${CASA_LNG - 0.05}%2C${CASA_LAT - 0.03}%2C${CASA_LNG + 0.05}%2C${CASA_LAT + 0.03}&layer=mapnik&marker=${CASA_LAT}%2C${CASA_LNG}`}
              loading="lazy"
            />
          </Reveal>
        </div>

        {/* ---------------- EL DIQUE ---------------- */}
        <div className="cdc-location-row cdc-row cdc-row--rev" style={{ marginTop: 60 }}>
          <Reveal className="cdc-photo">
            <img src={FotoDique} alt={`Vista de ${DIQUE_NOMBRE}`} />
          </Reveal>
          <Reveal>
            <span className="cdc-eyebrow-num">A UN PASO DEL AGUA</span>
            <h3 className="cdc-h3">{DIQUE_NOMBRE}, recién abierto</h3>
            <p className="cdc-body" style={{ color: "#CFCABA" }}>
              A solo {DIQUE_DISTANCIA_KM} km de la casa está {DIQUE_NOMBRE}, abrio
              sus puertas. Ideal para pasar el día, pescar o simplemente mirar el agua después de
              una mañana en la casa.
            </p>
            <ul className="cdc-location-list">
              <li>
                <MapPin size={17} color="#C9A24B" /> A {DIQUE_DISTANCIA_KM} km de la casa
              </li>
              <li>
                <Car size={17} color="#C9A24B" /> A {DIQUE_DISTANCIA_MIN} min en auto (aprox.)
              </li>
            </ul>
            <a
              className="cdc-btn cdc-btn--md"
              style={{ marginTop: 22, display: "inline-flex" }}
              href="https://maps.app.goo.gl/7A2VzsQtJ179UmC7A"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation size={15} /> Ver {DIQUE_NOMBRE} en el mapa
            </a>
          </Reveal>
        </div>

        <div className="cdc-booking-cta">
          <button className="cdc-btn" type="button" onClick={() => navigate("/disponibilidad")}>
            ALQUILA AHORA!!
          </button>
        </div>
      </section>

      <HillDivider from="#333B29" to="#20261A" />
    </div>
  );
}

export default Casa;
