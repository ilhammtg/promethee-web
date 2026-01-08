document.addEventListener("DOMContentLoaded", () => {
    loadCriteria();
    loadPatients();

    // Bind Process Referral Button
    const btn = document.getElementById("btnRecommend");
    if (btn) btn.addEventListener("click", savePatient);
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

        // Fetch all parameters in parallel
        const criteriaWithParams = await Promise.all(data.criteria.map(async (c) => {
            try {
                const resP = await fetch(`/api/criteria/${c.id}/parameters`);
                const dataP = await resP.json();
                return { ...c, params: dataP.parameters || [] };
            } catch (err) {
                console.error("Failed to fetch params for", c.id, err);
                return { ...c, params: [] };
            }
        }));

        criteriaWithParams.forEach(c => {
            const div = document.createElement("div");
            div.className = "flex items-center gap-4";

            let inputHtml = '';
            
            if (c.params.length > 0) {
                // Render Select
                const options = c.params.map(p => `<option value="${p.value}">${p.name} (Bobot: ${p.value})</option>`).join("");
                inputHtml = `
                    <select class="criteria-weight-input w-full rounded px-2 py-1 text-sm border border-slate-300 focus:border-primary-500 bg-white" 
                            data-id="${c.id}">
                        <option value="" disabled selected>Pilih Nilai...</option>
                        ${options}
                    </select>
                `;
            } else {
                // Render Default Number Input
                inputHtml = `
                    <input type="number" 
                        step="0.1" 
                        min="0"
                        class="criteria-weight-input w-full rounded px-2 py-1 text-sm border border-slate-300 focus:border-primary-500" 
                        data-id="${c.id}" 
                        value="${c.weight}">
                `;
            }

            div.innerHTML = `
                <div class="flex-1">
                    <label class="block text-sm font-medium text-slate-700">${c.name} (${c.code})</label>
                    <p class="text-xs text-slate-400">Type: ${c.type}</p>
                </div>
                <div class="w-48"> <!-- Wider for select -->
                   ${inputHtml}
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
    const tbody = document.getElementById("patientList");
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-slate-400">Loading...</td></tr>';

    try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        renderTable(data.patients || []);
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading data.</td></tr>';
        console.error(e);
    }
}

async function savePatient(e) {
    if(e) e.preventDefault();
    
    // Gather basic info
    const name = document.getElementById("patientName").value;
    const age = document.getElementById("patientAge").value;
    const gender = document.getElementById("patientGender").value;
    const notes = document.getElementById("patientNotes").value;

    if (!name) {
        alert("Nama pasien wajib diisi.");
        return;
    }

    // Gather criteria weights
    const inputs = document.querySelectorAll(".criteria-weight-input");
    const custom_weights = {};
    inputs.forEach(input => {
        const id = input.getAttribute("data-id");
        const val = input.value;
        if (id && val) custom_weights[id] = parseFloat(val);
    });

    const btn = document.getElementById("btnRecommend");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Proses...`;
    lucide.createIcons();

    try {
        const payload = {
            user_data: { name, age: parseInt(age)||0, gender, condition_notes: notes },
            custom_weights
        };

        const res = await fetch("/api/patients/referral", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();

        if (res.ok && data.status === "success") {
            // Redirect to report
            window.location.href = data.redirect_url;
        } else {
            alert("Error: " + (data.detail || "Gagal memproses rujukan"));
        }

    } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan koneksi.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
        lucide.createIcons();
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
        alert("Gagal menghapus.");
    }
}

function renderTable(patients) {
    const tbody = document.getElementById("patientList");
    if (!patients || patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-500">Belum ada data pasien.</td></tr>';
        return;
    }

    tbody.innerHTML = patients.map(p => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium text-slate-900">${p.name}</td>
            <td class="px-6 py-4 text-slate-500">${p.age} Tahun</td>
            <td class="px-6 py-4 text-slate-500">${p.gender}</td>
            <td class="px-6 py-4">
                ${p.recommended_hospital 
                    ? `<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs uppercase tracking-wide border border-green-200">${p.recommended_hospital}</span>` 
                    : `<span class="text-slate-400 italic text-xs">Belum diproses</span>`
                }
            </td>
            <td class="px-6 py-4 text-center flex justify-center gap-2">
                ${p.recommended_alt_id 
                    ? `<a href="/report/${p.id}" class="text-indigo-600 hover:text-indigo-800 p-2 rounded hover:bg-indigo-50 transition-colors" title="Lihat Laporan">
                        <i data-lucide="file-text" class="w-4 h-4"></i>
                       </a>
                       <a href="/report/${p.id}?print=true" class="text-slate-600 hover:text-slate-800 p-2 rounded hover:bg-slate-50 transition-colors" title="Cetak PDF" target="_blank">
                        <i data-lucide="printer" class="w-4 h-4"></i>
                       </a>` 
                    : ''
                }
                <button onclick="deletePatient(${p.id})" class="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors" title="Hapus">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        </tr>
    `).join("");
    lucide.createIcons();
}

// Make deletePatient global so onclick works
window.deletePatient = deletePatient;
