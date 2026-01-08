document.addEventListener("DOMContentLoaded", () => {
    loadCriteria();
    loadPatients();

    document.getElementById("btnSavePatient").addEventListener("click", savePatient);
    document.getElementById("btnRecommend").addEventListener("click", getRecommendation);
});

async function loadCriteria() {
    const container = document.getElementById("criteriaWeightsContainer");
    container.innerHTML = '<p class="text-sm text-slate-400">Loading...</p>';

    try {
        const res = await fetch("/api/criteria");
        const data = await res.json();

        container.innerHTML = "";

        if (!data.criteria || data.criteria.length === 0) {
            container.innerHTML = '<p class="text-sm text-slate-500">Belum ada kriteria.</p>';
            return;
        }

        data.criteria.forEach(c => {
            const div = document.createElement("div");
            div.className = "flex items-center gap-4";

            div.innerHTML = `
                <div class="flex-1">
                    <label class="block text-sm font-medium text-slate-700">${c.name} (${c.code})</label>
                    <p class="text-xs text-slate-400">Default: ${c.weight} | Type: ${c.type}</p>
                </div>
                <div class="w-24">
                   <input type="number" 
                        step="0.1" 
                        min="0"
                        class="criteria-weight-input w-full rounded px-2 py-1 text-sm border border-slate-300 focus:border-primary-500" 
                        data-id="${c.id}" 
                        value="${c.weight}">
                </div>
            `;
            container.appendChild(div);
        });

    } catch (e) {
        container.innerHTML = '<p class="text-sm text-red-500">Gagal memuat kriteria.</p>';
        console.error(e);
    }
}

async function loadPatients() {
    const tbody = document.getElementById("patientsTableBody");
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-slate-400">Loading...</td></tr>';

    try {
        const res = await fetch("/api/patients");
        const data = await res.json();

        tbody.innerHTML = "";

        if (!data.patients || data.patients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-slate-500">Belum ada data pasien.</td></tr>';
            return;
        }

        data.patients.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="px-4 py-3 font-medium text-slate-900">${p.name}</td>
                <td class="px-4 py-3 text-slate-600">${p.age || '-'}</td>
                <td class="px-4 py-3 text-slate-600 truncate max-w-xs">${p.condition_notes || '-'}</td>
                <td class="px-4 py-3">
                    <button class="text-red-600 hover:text-red-800" onclick="deletePatient(${p.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading data.</td></tr>';
        console.error(e);
    }
}

async function savePatient() {
    const name = document.getElementById("patientName").value;
    const age = document.getElementById("patientAge").value;
    const gender = document.getElementById("patientGender").value;
    const notes = document.getElementById("patientNotes").value;

    if (!name) {
        alert("Nama pasien wajib diisi.");
        return;
    }

    try {
        const res = await fetch("/api/patients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                age: age ? parseInt(age) : 0,
                gender,
                condition_notes: notes
            })
        });

        if (res.ok) {
            // Clear form
            document.getElementById("patientName").value = "";
            document.getElementById("patientAge").value = "";
            document.getElementById("patientNotes").value = "";
            loadPatients();
        } else {
            alert("Gagal menyimpan pasien.");
        }
    } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan.");
    }
}

async function deletePatient(id) {
    if (!confirm("Hapus data pasien ini?")) return;

    try {
        const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
        if (res.ok) loadPatients();
        else alert("Gagal menghapus.");
    } catch (e) {
        console.error(e);
    }
}

async function getRecommendation() {
    const inputs = document.querySelectorAll(".criteria-weight-input");
    const custom_weights = {};

    inputs.forEach(input => {
        const id = input.getAttribute("data-id");
        const val = input.value;
        if (id) custom_weights[id] = parseFloat(val) || 0;
    });

    const tbody = document.getElementById("recommendationTableBody");
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-8 text-slate-400">Menghitung rekomendasi...</td></tr>';

    try {
        const res = await fetch("/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ custom_weights })
        });
        const data = await res.json();

        tbody.innerHTML = "";

        if (data.error) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-red-500">${data.error}</td></tr>`;
            return;
        }

        if (!data.results || data.results.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-slate-500">Tidak ada hasil.</td></tr>';
            return;
        }

        data.results.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="px-4 py-3 text-center font-bold text-slate-700">#${item.ranking}</td>
                <td class="px-4 py-3">
                    <div class="font-medium text-slate-900">${item.name}</div>
                    <div class="text-xs text-slate-500">${item.code}</div>
                </td>
                <td class="px-4 py-3 text-right font-mono text-slate-600">${item.net_flow.toFixed(4)}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-red-500">Terjadi kesalahan perhitungan.</td></tr>';
        console.error(e);
    }
}

// Make deletePatient global so onclick works
window.deletePatient = deletePatient;
