async function fetchResults() {
    const res = await fetch("/results");
    const data = await res.json();
    return data.results || [];
}

function showAlert(message, type = "success") {
    const box = document.getElementById("alertBox");
    const color = type === "danger" ? "red" : "green";
    box.className = `p-4 mb-4 rounded-lg bg-${color}-50 text-${color}-700 border border-${color}-200`;
    box.textContent = message;
    box.classList.remove("hidden");
    setTimeout(() => box.classList.add("hidden"), 2500);
}

function renderTable(rows) {
    const body = document.getElementById("resultBody");
    if (!rows.length) {
        body.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Belum ada data.</td></tr>`;
        return;
    }

    body.innerHTML = rows.map(r => `
    <tr>
      <td class="text-center"><strong>${r.ranking ?? ""}</strong></td>
      <td class="text-center">${r.code ?? ""}</td>
      <td>${r.name ?? ""}</td>
      <td class="text-right">${Number(r.leaving_flow).toFixed(6)}</td>
      <td class="text-right">${Number(r.entering_flow).toFixed(6)}</td>
      <td class="text-right font-bold text-primary-600">${Number(r.net_flow).toFixed(6)}</td>
    </tr>
  `).join("");
}

async function refresh() {
    const rows = await fetchResults();
    renderTable(rows);
}

async function compute() {
    const btn = document.getElementById("btnCompute");
    btn.disabled = true;
    btn.textContent = "Menghitung...";

    try {
        const res = await fetch("/compute/promethee", { method: "POST" });
        const data = await res.json();

        if (data.error) {
            showAlert(data.error, "danger");
        } else {
            showAlert("Perhitungan selesai. Memuat hasil...", "success");
            await refresh();
        }
    } catch (e) {
        showAlert("Gagal menghitung. Cek server/DB.", "danger");
    } finally {
        btn.disabled = false;
        btn.textContent = "Hitung PROMETHEE";
    }
}

document.getElementById("btnRefresh").addEventListener("click", refresh);
document.getElementById("btnCompute").addEventListener("click", compute);

// auto-load
refresh();
