/* ---------------------------------------------------------
   Silueta de sierra que separa secciones. Es el elemento
   firma del sitio: el mismo horizonte que se ve desde la
   casa, repetido entre secciones y entre páginas.
   from/to son colores dinámicos por instancia; el resto del
   look (alto, overflow) vive en el CSS de cada página que lo
   use, en la clase .cdc-hill.
--------------------------------------------------------- */
export default function HillDivider({ from, to, flip = false }) {
  return (
    <div
      aria-hidden="true"
      className={`cdc-hill ${flip ? "cdc-hill--flip" : ""}`}
      style={{ background: from }}
    >
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path
          d="M0,80 C160,40 300,100 480,60 C650,20 780,90 960,55 C1120,25 1280,85 1440,50 L1440,120 L0,120 Z"
          fill={to}
          opacity="0.55"
        />
        <path
          d="M0,100 C200,60 380,115 600,80 C820,45 980,110 1180,75 C1300,55 1380,95 1440,80 L1440,120 L0,120 Z"
          fill={to}
        />
      </svg>
    </div>
  );
}
