document.addEventListener('DOMContentLoaded', function () {
  const contenedor = document.getElementById('malla');
  const progresoBarra = document.getElementById('progreso');
  const resetBtn = document.getElementById('reset');
  let materias = [];

  fetch('materias.json')
    .then(res => res.json())
    .then(data => {
      materias = data;
      crearMalla();
      cargarProgreso();
      actualizarEstadoMaterias();
      actualizarProgreso();
    });

  function crearMalla() {
    const maxSemestre = Math.max(...materias.map(m => m.semestre));

    for (let i = 0; i <= maxSemestre; i++) {
      const columna = document.createElement('div');
      columna.classList.add('semestre');

      const titulo = document.createElement('h2');
      if (i === 0) {
        titulo.textContent = "Semestre 0";
      } else {
      titulo.textContent = `Semestre ${romano(i)}`;
      }
      columna.appendChild(titulo);

      materias
        .filter(m => m.semestre === i)
        .forEach(m => {
          const div = document.createElement('div');
          div.classList.add('materia');
          div.dataset.id = m.id;
          div.dataset.tipo = m.tipo;
          div.dataset.creditos = m.creditos;

          const nombre = document.createElement('span');
          nombre.textContent = m.nombre;
          div.appendChild(nombre);

          const creditos = document.createElement('div');
          creditos.classList.add('creditos');
          creditos.textContent = `${m.creditos} créditos`;
          div.appendChild(creditos);

          if (i === 1) {
            div.classList.add('desbloqueada');
          } else {
            div.classList.add('bloqueada');
          }
          if (i === 0 || i === 1) {
            div.classList.add('desbloqueada');
          } else {
            div.classList.add('bloqueada');
          }

          div.addEventListener('click', function () {
            if (!div.classList.contains('bloqueada')) {
              div.classList.toggle('aprobada');
              guardarProgreso();
              actualizarEstadoMaterias();
              actualizarProgreso();
            }
          });

          columna.appendChild(div);
        });

      contenedor.appendChild(columna);
    }
  }

  function actualizarEstadoMaterias() {
  const aprobadas = Array.from(document.querySelectorAll('.materia.aprobada'))
                         .map(m => m.dataset.id);

  materias.forEach(m => {
    const div = document.querySelector(`.materia[data-id="${m.id}"]`);

    const prerrequisitos = materias
      .filter(mat => mat.abre.includes(m.id))
      .map(p => p.id);

    let desbloqueada = false;

    if (m.semestre === 0) {
      desbloqueada = true;
    } 
    else if (prerrequisitos.length === 0 && m.semestre === 1) {
      desbloqueada = true;
    }
    else {
      desbloqueada = prerrequisitos.every(p => aprobadas.includes(p));
    }

    if (desbloqueada) {
      div.classList.remove('bloqueada');
      div.classList.add('desbloqueada');
    } else {
      div.classList.add('bloqueada');
      div.classList.remove('desbloqueada');
      div.classList.remove('aprobada');
    }
  });
}

  function guardarProgreso() {
    const estado = {};
    document.querySelectorAll('.materia').forEach(m => {
      estado[m.dataset.id] = m.classList.contains('aprobada');
    });
    localStorage.setItem('progresoFarmacia', JSON.stringify(estado));
  }

  function cargarProgreso() {
    const estado = JSON.parse(localStorage.getItem('progresoFarmacia') || '{}');
    document.querySelectorAll('.materia').forEach(m => {
      if (estado[m.dataset.id]) {
        m.classList.add('aprobada');
      }
    });
  }

  function actualizarProgreso() {
  const materiasDOM = document.querySelectorAll('.materia');

  const total = materiasDOM.length;
  const aprobadas = document.querySelectorAll('.materia.aprobada').length;

  const porcentaje = Math.round((aprobadas / total) * 100);

  progresoBarra.style.width = `${porcentaje}%`;
  progresoBarra.textContent = `${porcentaje}%`;

  let creditosTotales = 0;
  let creditosAprobados = 0;

  materiasDOM.forEach(m => {
    const c = parseInt(m.dataset.creditos || "0", 10);
    if (c > 0) {
      creditosTotales += c;
      if (m.classList.contains('aprobada')) {
        creditosAprobados += c;
      }
    }
  });

  const creditosTexto = document.getElementById('creditos-aprobados');
  creditosTexto.textContent = `Créditos aprobados: ${creditosAprobados} / ${creditosTotales}`;
}


  function romano(num) {
    const mapa = {
      1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
      6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X'
    };
    return mapa[num] || num;
  }
});
