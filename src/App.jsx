<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview Paletas</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0a0a; font-family: 'Segoe UI', system-ui, sans-serif; padding: 2rem 1rem; }

h1 { text-align: center; color: #fff; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem; }
.subtitle { text-align: center; color: #666; font-size: 0.82rem; margin-bottom: 3rem; }

.palettes { display: flex; flex-direction: column; gap: 4rem; }

/* CADA PALETA */
.palette-block { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); }
.palette-label { padding: 0.6rem 1.5rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center; }
.palette-swatches { display: flex; gap: 6px; }
.swatch { width: 18px; height: 18px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12); }

/* MINI HERO */
.mini-hero { padding: 3rem 2.5rem 2.5rem; }
.badge { display: inline-block; border: 1px solid; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.3rem 0.85rem; border-radius: 20px; margin-bottom: 1.25rem; }
.mini-hero h2 { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; line-height: 1.2; margin-bottom: 1rem; }
.mini-hero p { font-size: 0.92rem; max-width: 520px; line-height: 1.7; margin-bottom: 2rem; opacity: 0.65; }
.btn { display: inline-block; padding: 0.85rem 2rem; border-radius: 8px; font-size: 0.92rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: transform 0.15s; }
.btn:hover { transform: translateY(-2px); }

/* MINI PAIN */
.mini-pain { padding: 2rem 2.5rem 2.5rem; }
.mini-pain .section-tag { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; }
.mini-pain h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 1.5rem; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.card { border-radius: 10px; padding: 1.25rem; border: 1px solid; }
.card h4 { font-size: 0.88rem; font-weight: 700; margin-bottom: 0.4rem; }
.card p { font-size: 0.78rem; line-height: 1.6; opacity: 0.65; }

/* PALETA: ORIGINAL (morado actual) */
.p-original .palette-label { background: #151820; color: #a78bfa; }
.p-original .mini-hero { background: radial-gradient(ellipse at 60% 0%, rgba(108,99,255,0.18) 0%, transparent 60%), #0d0f14; color: #e8eaf0; }
.p-original .badge { background: rgba(108,99,255,0.15); border-color: rgba(108,99,255,0.35); color: #a78bfa; }
.p-original .mini-hero h2 span { color: #a78bfa; }
.p-original .btn { background: #6c63ff; color: #fff; }
.p-original .mini-pain { background: #151820; color: #e8eaf0; }
.p-original .mini-pain .section-tag { color: #a78bfa; }
.p-original .card { background: #1e2230; border-color: rgba(255,255,255,0.05); }

/* PALETA: AZUL+ROSA (colores Escuela) */
.p-escuela .palette-label { background: #05060f; color: #FF2769; }
.p-escuela .mini-hero { background: radial-gradient(ellipse at 60% 0%, rgba(33,43,255,0.2) 0%, transparent 60%), #05060f; color: #f0f0f8; }
.p-escuela .badge { background: rgba(33,43,255,0.15); border-color: rgba(33,43,255,0.4); color: #7b83ff; }
.p-escuela .mini-hero h2 span { color: #FF2769; }
.p-escuela .btn { background: #FF2769; color: #fff; }
.p-escuela .mini-pain { background: #0d0e1a; color: #f0f0f8; }
.p-escuela .mini-pain .section-tag { color: #FF2769; }
.p-escuela .card { background: #13152a; border-color: rgba(33,43,255,0.2); }

/* PALETA: NARANJA */
.p-naranja .palette-label { background: #110c08; color: #FF9A7A; }
.p-naranja .mini-hero { background: radial-gradient(ellipse at 60% 0%, rgba(255,106,61,0.2) 0%, transparent 60%), #0f0a07; color: #f5ede8; }
.p-naranja .badge { background: rgba(255,106,61,0.15); border-color: rgba(255,106,61,0.35); color: #FF9A7A; }
.p-naranja .mini-hero h2 span { color: #FF6A3D; }
.p-naranja .btn { background: #FF6A3D; color: #fff; }
.p-naranja .mini-pain { background: #130d09; color: #f5ede8; }
.p-naranja .mini-pain .section-tag { color: #FF9A7A; }
.p-naranja .card { background: #1c1108; border-color: rgba(255,106,61,0.18); }

/* PALETA: VERDE */
.p-verde .palette-label { background: #071210; color: #74E5C3; }
.p-verde .mini-hero { background: radial-gradient(ellipse at 60% 0%, rgba(46,209,162,0.18) 0%, transparent 60%), #060e0b; color: #e8f5f2; }
.p-verde .badge { background: rgba(46,209,162,0.12); border-color: rgba(46,209,162,0.3); color: #74E5C3; }
.p-verde .mini-hero h2 span { color: #2ED1A2; }
.p-verde .btn { background: #1FA37F; color: #fff; }
.p-verde .mini-pain { background: #07100d; color: #e8f5f2; }
.p-verde .mini-pain .section-tag { color: #2ED1A2; }
.p-verde .card { background: #0d1a14; border-color: rgba(46,209,162,0.15); }

/* PALETA: AMARILLO */
.p-amarillo .palette-label { background: #100f03; color: #FFE866; }
.p-amarillo .mini-hero { background: radial-gradient(ellipse at 60% 0%, rgba(255,212,0,0.15) 0%, transparent 60%), #0e0d02; color: #f5f4e0; }
.p-amarillo .badge { background: rgba(255,212,0,0.12); border-color: rgba(255,212,0,0.3); color: #FFE866; }
.p-amarillo .mini-hero h2 span { color: #FFD400; }
.p-amarillo .btn { background: #FFD400; color: #0e0d02; }
.p-amarillo .mini-pain { background: #100f03; color: #f5f4e0; }
.p-amarillo .mini-pain .section-tag { color: #FFD400; }
.p-amarillo .card { background: #181600; border-color: rgba(255,212,0,0.12); }

/* PALETA: MORADO (brand) */
.p-morado .palette-label { background: #09060f; color: #8C6CFF; }
.p-morado .mini-hero { background: radial-gradient(ellipse at 60% 0%, rgba(91,46,255,0.2) 0%, transparent 60%), #080610; color: #ede9ff; }
.p-morado .badge { background: rgba(91,46,255,0.15); border-color: rgba(91,46,255,0.35); color: #8C6CFF; }
.p-morado .mini-hero h2 span { color: #8C6CFF; }
.p-morado .btn { background: #5B2EFF; color: #fff; }
.p-morado .mini-pain { background: #0d0a18; color: #ede9ff; }
.p-morado .mini-pain .section-tag { color: #8C6CFF; }
.p-morado .card { background: #130f22; border-color: rgba(91,46,255,0.18); }

/* PALETA: CELESTE */
.p-celeste .palette-label { background: #03090f; color: #66DBFF; }
.p-celeste .mini-hero { background: radial-gradient(ellipse at 60% 0%, rgba(0,194,255,0.18) 0%, transparent 60%), #030b10; color: #e0f6ff; }
.p-celeste .badge { background: rgba(0,194,255,0.12); border-color: rgba(0,194,255,0.3); color: #66DBFF; }
.p-celeste .mini-hero h2 span { color: #00C2FF; }
.p-celeste .btn { background: #0099CC; color: #fff; }
.p-celeste .mini-pain { background: #040c12; color: #e0f6ff; }
.p-celeste .mini-pain .section-tag { color: #00C2FF; }
.p-celeste .card { background: #061520; border-color: rgba(0,194,255,0.15); }

/* PALETA: AZUL+ROSA con acento verde (combo) */
.p-combo .palette-label { background: #05060f; color: #2ED1A2; }
.p-combo .mini-hero { background: radial-gradient(ellipse at 60% 0%, rgba(33,43,255,0.2) 0%, transparent 60%), #05060f; color: #f0f0f8; }
.p-combo .badge { background: rgba(46,209,162,0.1); border-color: rgba(46,209,162,0.3); color: #2ED1A2; }
.p-combo .mini-hero h2 span { color: #2ED1A2; }
.p-combo .btn { background: #212BFF; color: #fff; }
.p-combo .mini-pain { background: #0d0e1a; color: #f0f0f8; }
.p-combo .mini-pain .section-tag { color: #2ED1A2; }
.p-combo .card { background: #13152a; border-color: rgba(33,43,255,0.2); }
</style>
</head>
<body>

<h1>Explorador de Paletas</h1>
<p class="subtitle">Misma estructura · 8 combinaciones de color · Elige la que más conecta</p>

<div class="palettes">

  <!-- ORIGINAL -->
  <div class="palette-block p-original">
    <div class="palette-label">
      ACTUAL — Morado suave (base de comparación)
      <div class="palette-swatches">
        <div class="swatch" style="background:#6c63ff"></div>
        <div class="swatch" style="background:#a78bfa"></div>
        <div class="swatch" style="background:#0d0f14"></div>
      </div>
    </div>
    <div class="mini-hero">
      <div class="badge">Programa online · Facilitación Esencial</div>
      <h2>Aprende a facilitar <span>conversaciones que mueven</span> a grupos hacia resultados.</h2>
      <p>Para líderes, HR y consultores que necesitan estructurar dinámicas, talleres y reuniones críticas — sin improvisar.</p>
      <div class="btn">Quiero inscribirme →</div>
    </div>
    <div class="mini-pain">
      <div class="section-tag">El problema</div>
      <h3>Tienes que liderar conversaciones que el grupo aún no sabe tener.</h3>
      <div class="cards">
        <div class="card"><h4>La conversación no avanza</h4><p>El grupo gira en círculos. Al final nadie sabe qué se decidió ni quién hace qué.</p></div>
        <div class="card"><h4>Los mismos temas, semana tras semana</h4><p>Se habla mucho, se decide poco. Los acuerdos no se sostienen.</p></div>
        <div class="card"><h4>Cada proceso clave depende de un externo</h4><p>Sin un facilitador interno capaz, todo pasa por contratar a alguien.</p></div>
      </div>
    </div>
  </div>

  <!-- AZUL + ROSA ESCUELA -->
  <div class="palette-block p-escuela">
    <div class="palette-label">
      AZUL + ROSA — Colores Escuela de Facilitadores
      <div class="palette-swatches">
        <div class="swatch" style="background:#212BFF"></div>
        <div class="swatch" style="background:#FF2769"></div>
        <div class="swatch" style="background:#05060f"></div>
      </div>
    </div>
    <div class="mini-hero">
      <div class="badge">Programa online · Facilitación Esencial</div>
      <h2>Aprende a facilitar <span>conversaciones que mueven</span> a grupos hacia resultados.</h2>
      <p>Para líderes, HR y consultores que necesitan estructurar dinámicas, talleres y reuniones críticas — sin improvisar.</p>
      <div class="btn">Quiero inscribirme →</div>
    </div>
    <div class="mini-pain">
      <div class="section-tag">El problema</div>
      <h3>Tienes que liderar conversaciones que el grupo aún no sabe tener.</h3>
      <div class="cards">
        <div class="card"><h4>La conversación no avanza</h4><p>El grupo gira en círculos. Al final nadie sabe qué se decidió ni quién hace qué.</p></div>
        <div class="card"><h4>Los mismos temas, semana tras semana</h4><p>Se habla mucho, se decide poco. Los acuerdos no se sostienen.</p></div>
        <div class="card"><h4>Cada proceso clave depende de un externo</h4><p>Sin un facilitador interno capaz, todo pasa por contratar a alguien.</p></div>
      </div>
    </div>
  </div>

  <!-- NARANJA -->
  <div class="palette-block p-naranja">
    <div class="palette-label">
      NARANJA — Energía y acción
      <div class="palette-swatches">
        <div class="swatch" style="background:#FF6A3D"></div>
        <div class="swatch" style="background:#FF9A7A"></div>
        <div class="swatch" style="background:#0f0a07"></div>
      </div>
    </div>
    <div class="mini-hero">
      <div class="badge">Programa online · Facilitación Esencial</div>
      <h2>Aprende a facilitar <span>conversaciones que mueven</span> a grupos hacia resultados.</h2>
      <p>Para líderes, HR y consultores que necesitan estructurar dinámicas, talleres y reuniones críticas — sin improvisar.</p>
      <div class="btn">Quiero inscribirme →</div>
    </div>
    <div class="mini-pain">
      <div class="section-tag">El problema</div>
      <h3>Tienes que liderar conversaciones que el grupo aún no sabe tener.</h3>
      <div class="cards">
        <div class="card"><h4>La conversación no avanza</h4><p>El grupo gira en círculos. Al final nadie sabe qué se decidió ni quién hace qué.</p></div>
        <div class="card"><h4>Los mismos temas, semana tras semana</h4><p>Se habla mucho, se decide poco. Los acuerdos no se sostienen.</p></div>
        <div class="card"><h4>Cada proceso clave depende de un externo</h4><p>Sin un facilitador interno capaz, todo pasa por contratar a alguien.</p></div>
      </div>
    </div>
  </div>

  <!-- VERDE -->
  <div class="palette-block p-verde">
    <div class="palette-label">
      VERDE — Confianza y crecimiento
      <div class="palette-swatches">
        <div class="swatch" style="background:#2ED1A2"></div>
        <div class="swatch" style="background:#74E5C3"></div>
        <div class="swatch" style="background:#060e0b"></div>
      </div>
    </div>
    <div class="mini-hero">
      <div class="badge">Programa online · Facilitación Esencial</div>
      <h2>Aprende a facilitar <span>conversaciones que mueven</span> a grupos hacia resultados.</h2>
      <p>Para líderes, HR y consultores que necesitan estructurar dinámicas, talleres y reuniones críticas — sin improvisar.</p>
      <div class="btn">Quiero inscribirme →</div>
    </div>
    <div class="mini-pain">
      <div class="section-tag">El problema</div>
      <h3>Tienes que liderar conversaciones que el grupo aún no sabe tener.</h3>
      <div class="cards">
        <div class="card"><h4>La conversación no avanza</h4><p>El grupo gira en círculos. Al final nadie sabe qué se decidió ni quién hace qué.</p></div>
        <div class="card"><h4>Los mismos temas, semana tras semana</h4><p>Se habla mucho, se decide poco. Los acuerdos no se sostienen.</p></div>
        <div class="card"><h4>Cada proceso clave depende de un externo</h4><p>Sin un facilitador interno capaz, todo pasa por contratar a alguien.</p></div>
      </div>
    </div>
  </div>

  <!-- AMARILLO -->
  <div class="palette-block p-amarillo">
    <div class="palette-label">
      AMARILLO — Claridad y atención
      <div class="palette-swatches">
        <div class="swatch" style="background:#FFD400"></div>
        <div class="swatch" style="background:#FFE866"></div>
        <div class="swatch" style="background:#0e0d02"></div>
      </div>
    </div>
    <div class="mini-hero">
      <div class="badge">Programa online · Facilitación Esencial</div>
      <h2>Aprende a facilitar <span>conversaciones que mueven</span> a grupos hacia resultados.</h2>
      <p>Para líderes, HR y consultores que necesitan estructurar dinámicas, talleres y reuniones críticas — sin improvisar.</p>
      <div class="btn">Quiero inscribirme →</div>
    </div>
    <div class="mini-pain">
      <div class="section-tag">El problema</div>
      <h3>Tienes que liderar conversaciones que el grupo aún no sabe tener.</h3>
      <div class="cards">
        <div class="card"><h4>La conversación no avanza</h4><p>El grupo gira en círculos. Al final nadie sabe qué se decidió ni quién hace qué.</p></div>
        <div class="card"><h4>Los mismos temas, semana tras semana</h4><p>Se habla mucho, se decide poco. Los acuerdos no se sostienen.</p></div>
        <div class="card"><h4>Cada proceso clave depende de un externo</h4><p>Sin un facilitador interno capaz, todo pasa por contratar a alguien.</p></div>
      </div>
    </div>
  </div>

  <!-- MORADO BRAND -->
  <div class="palette-block p-morado">
    <div class="palette-label">
      MORADO — Premium y profundidad
      <div class="palette-swatches">
        <div class="swatch" style="background:#5B2EFF"></div>
        <div class="swatch" style="background:#8C6CFF"></div>
        <div class="swatch" style="background:#080610"></div>
      </div>
    </div>
    <div class="mini-hero">
      <div class="badge">Programa online · Facilitación Esencial</div>
      <h2>Aprende a facilitar <span>conversaciones que mueven</span> a grupos hacia resultados.</h2>
      <p>Para líderes, HR y consultores que necesitan estructurar dinámicas, talleres y reuniones críticas — sin improvisar.</p>
      <div class="btn">Quiero inscribirme →</div>
    </div>
    <div class="mini-pain">
      <div class="section-tag">El problema</div>
      <h3>Tienes que liderar conversaciones que el grupo aún no sabe tener.</h3>
      <div class="cards">
        <div class="card"><h4>La conversación no avanza</h4><p>El grupo gira en círculos. Al final nadie sabe qué se decidió ni quién hace qué.</p></div>
        <div class="card"><h4>Los mismos temas, semana tras semana</h4><p>Se habla mucho, se decide poco. Los acuerdos no se sostienen.</p></div>
        <div class="card"><h4>Cada proceso clave depende de un externo</h4><p>Sin un facilitador interno capaz, todo pasa por contratar a alguien.</p></div>
      </div>
    </div>
  </div>

  <!-- CELESTE -->
  <div class="palette-block p-celeste">
    <div class="palette-label">
      CELESTE — Tecnología y claridad
      <div class="palette-swatches">
        <div class="swatch" style="background:#00C2FF"></div>
        <div class="swatch" style="background:#66DBFF"></div>
        <div class="swatch" style="background:#030b10"></div>
      </div>
    </div>
    <div class="mini-hero">
      <div class="badge">Programa online · Facilitación Esencial</div>
      <h2>Aprende a facilitar <span>conversaciones que mueven</span> a grupos hacia resultados.</h2>
      <p>Para líderes, HR y consultores que necesitan estructurar dinámicas, talleres y reuniones críticas — sin improvisar.</p>
      <div class="btn">Quiero inscribirme →</div>
    </div>
    <div class="mini-pain">
      <div class="section-tag">El problema</div>
      <h3>Tienes que liderar conversaciones que el grupo aún no sabe tener.</h3>
      <div class="cards">
        <div class="card"><h4>La conversación no avanza</h4><p>El grupo gira en círculos. Al final nadie sabe qué se decidió ni quién hace qué.</p></div>
        <div class="card"><h4>Los mismos temas, semana tras semana</h4><p>Se habla mucho, se decide poco. Los acuerdos no se sostienen.</p></div>
        <div class="card"><h4>Cada proceso clave depende de un externo</h4><p>Sin un facilitador interno capaz, todo pasa por contratar a alguien.</p></div>
      </div>
    </div>
  </div>

  <!-- COMBO: AZUL + VERDE -->
  <div class="palette-block p-combo">
    <div class="palette-label">
      COMBO — Azul Escuela + Verde acento
      <div class="palette-swatches">
        <div class="swatch" style="background:#212BFF"></div>
        <div class="swatch" style="background:#2ED1A2"></div>
        <div class="swatch" style="background:#05060f"></div>
      </div>
    </div>
    <div class="mini-hero">
      <div class="badge">Programa online · Facilitación Esencial</div>
      <h2>Aprende a facilitar <span>conversaciones que mueven</span> a grupos hacia resultados.</h2>
      <p>Para líderes, HR y consultores que necesitan estructurar dinámicas, talleres y reuniones críticas — sin improvisar.</p>
      <div class="btn">Quiero inscribirme →</div>
    </div>
    <div class="mini-pain">
      <div class="section-tag">El problema</div>
      <h3>Tienes que liderar conversaciones que el grupo aún no sabe tener.</h3>
      <div class="cards">
        <div class="card"><h4>La conversación no avanza</h4><p>El grupo gira en círculos. Al final nadie sabe qué se decidió ni quién hace qué.</p></div>
        <div class="card"><h4>Los mismos temas, semana tras semana</h4><p>Se habla mucho, se decide poco. Los acuerdos no se sostienen.</p></div>
        <div class="card"><h4>Cada proceso clave depende de un externo</h4><p>Sin un facilitador interno capaz, todo pasa por contratar a alguien.</p></div>
      </div>
    </div>
  </div>

</div>

</body>
</html>
