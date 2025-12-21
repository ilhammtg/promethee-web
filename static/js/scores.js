let CRITERIA = [];
let ALTS = [];
let SCORE_MAP = {}; // key: a-c -> value

function showAlert(msg, type = "success") {
  const box = document.getElementById("alertBox");
  const color = type === "danger" ? "red" : "green";
  box.className = `p-4 mb-4 rounded-lg bg-${color}-50 text-${color}-700 border border-${color}-200`;
  box.textContent = msg;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 2500);
}

async function loadMatrix() {
  const res = await fetch("/api/scores-matrix");
  const data = await res.json();

  CRITERIA = data.criteria || [];
  ALTS = data.alternatives || [];
  SCORE_MAP = {};

  (data.scores || []).forEach(s => {
    SCORE_MAP[`${s.alternative_id}-${s.criteria_id}`] = s.value;
  });

  renderTable();
}

function renderTable() {
  const thead = document.getElementById("thead");
  const tbody = document.getElementById("tbody");

  // header
  thead.innerHTML = `
    <tr>
      <th class="px-4 py-3 font-semibold text-center bg-slate-50 border-b border-slate-100">Alternatif</th>
      ${CRITERIA.map(c => `<th class="px-4 py-3 text-center border-l border-slate-100"><div class="font-semibold text-slate-700">${c.code ?? ""}</div><div class="text-[10px] text-slate-500 font-normal uppercase tracking-wider">${c.name}</div></th>`).join("")}
    </tr>
  `;

  // body
  tbody.innerHTML = ALTS.map(a => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-4 py-3 border-r border-slate-100 bg-slate-50/50">
        <div class="font-bold text-slate-700 text-sm">${a.code ?? ""}</div>
        <div class="text-xs text-slate-500">${a.name}</div>
      </td>
      ${CRITERIA.map(c => {
    const key = `${a.id}-${c.id}`;
    const val = SCORE_MAP[key] ?? "";
    return `
          <td class="p-2 border-l border-slate-100 text-center">
            <input type="number" step="0.01"
              class="score-input w-full px-2 py-1 text-sm border border-slate-200 rounded focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-center"
              data-alt="${a.id}" data-crit="${c.id}"
              value="${val}" placeholder="0">
          </td>
        `;
  }).join("")}
    </tr>
  `).join("");
}

async function saveScores() {
  const inputs = document.querySelectorAll(".score-input");
  const values = [];

  inputs.forEach(inp => {
    if (inp.value !== "") {
      values.push({
        alternative_id: Number(inp.dataset.alt),
        criteria_id: Number(inp.dataset.crit),
        value: Number(inp.value)
      });
    }
  });

  if (!values.length) {
    showAlert("Tidak ada nilai untuk disimpan", "warning");
    return;
  }

  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ values })
  });
  const out = await res.json();

  if (out.status === "scores saved") {
    showAlert("Nilai berhasil disimpan", "success");
    // Re-fetch to ensure sync and update chart
    await loadMatrix();
    renderChart();
  } else {
    showAlert("Gagal menyimpan nilai", "danger");
  }
}

let chartInstance = null;

function renderChart() {
  if (!CRITERIA.length || !ALTS.length) return;

  const series = ALTS.map(a => {
    return {
      name: a.name || a.code,
      data: CRITERIA.map(c => {
        const key = `${a.id}-${c.id}`;
        return SCORE_MAP[key] ? Number(SCORE_MAP[key]) : 0;
      })
    };
  });

  const options = {
    series: series,
    chart: {
      height: 400,
      type: 'radar',
      toolbar: { show: false }
    },
    stroke: {
      width: 2
    },
    fill: {
      opacity: 0.1
    },
    markers: {
      size: 4
    },
    xaxis: {
      categories: CRITERIA.map(c => c.name || c.code)
    },
    yaxis: {
      show: false
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'], // Tailwind colors
    legend: {
      position: 'bottom'
    }
  };

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new ApexCharts(document.querySelector("#chart"), options);
  chartInstance.render();
}

document.getElementById("btnReload").addEventListener("click", loadMatrix);
document.getElementById("btnSave").addEventListener("click", saveScores);

// init
loadMatrix().then(() => {
  // Attempt render after load
  renderChart();
});
