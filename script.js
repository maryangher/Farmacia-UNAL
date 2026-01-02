let materias = [];
let estado = JSON.parse(localStorage.getItem("estado")) || {};

fetch("materias.json")
  .then(r => r.json())
  .then(data => {
    materias = data;
    render();
  });

function render() {
  const cont = document.getElementById("malla");
  cont.innerHTML = "";

  materias.forEach(sem => {
    const col = document.createElement("div");
    col.className = "semestre";
    col.innerHTML = `<h2>${sem.nombre}</h2>`;

    sem.materias.forEach(m => {
      const d = document.createElement("div");
      d.className = "materia";
      d.innerHTML = `${m.nombre}<br><span>${m.creditos} créditos</span>`;

      if (estado[m.nombre]) d.classList.add("aprobada");
      else if (!puedeCursar(m)) d.classList.add("bloqueada");

      d.onclick = () => toggle(m);
      col.appendChild(d);
    });

    cont.appendChild(col);
  });

  actualizarProgreso();
}

function puedeCursar(m) {
  return m.prerrequisitos.every(p => estado[p]);
}

function toggle(m) {
  if (!puedeCursar(m)) return;
  estado[m.nombre] = !estado[m.nombre];
  localStorage.setItem("estado", JSON.stringify(estado));
  render();
}

function actualizarProgreso() {
  let total = 0, hechas = 0, creditos = 0;

  materias.forEach(s => s.materias.forEach(m => {
    total++;
    if (estado[m.nombre]) {
      hechas++;
      creditos += m.creditos;
    }
  }));

  let p = (hechas / total) * 100;
  document.getElementById("barra-progreso").style.width = p + "%";
  document.getElementById("progreso-texto").innerText = `Progreso: ${Math.round(p)}%`;
  document.getElementById("creditos-texto").innerText = `Créditos aprobados: ${creditos}`;
}

document.getElementById("reset").onclick = () => {
  estado = {};
  localStorage.clear();
  render();
};