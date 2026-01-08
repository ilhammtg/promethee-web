function showAlert(msg, type = "success") {
    const box = document.getElementById("alertBox");
    const color = type === "danger" ? "red" : "green";
    box.className = `p-4 mb-4 rounded-lg bg-${color}-50 text-${color}-700 border border-${color}-200`;
    box.textContent = msg;
    box.classList.remove("hidden");
    setTimeout(() => box.classList.add("hidden"), 2500);
}

async function loadData() {
    const container = document.getElementById("criteriaContainer");
    
    try {
        const res = await fetch("/api/criteria");
        const data = await res.json();
        const criteriaList = data.criteria || [];

        if (!criteriaList.length) {
            container.innerHTML = `<div class="text-center py-12 text-slate-500">Belum ada kriteria. Silakan tambahkan kriteria terlebih dahulu.</div>`;
            return;
        }

        container.innerHTML = ""; // Clear loader

        for (const criterion of criteriaList) {
            // Fetch params for this criterion
            const resParams = await fetch(`/api/criteria/${criterion.id}/parameters`);
            const dataParams = await resParams.json();
            const params = dataParams.parameters || [];

            const card = document.createElement("div");
            card.className = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden";
            card.innerHTML = `
                <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                        <span class="font-bold text-lg text-slate-800">${criterion.code} - ${criterion.name}</span>
                        <span class="ml-2 px-2 py-0.5 text-xs rounded-full ${criterion.type === 'benefit' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} font-medium capitalize">${criterion.type}</span>
                    </div>
                    <div class="text-sm text-slate-500">Bobot: ${Number(criterion.weight).toFixed(2)}</div>
                </div>
                <div class="p-6">
                    <!-- Add Param Form -->
                    <div class="flex flex-col sm:flex-row gap-3 items-end mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div class="flex-1 w-full relative">
                            <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Parameter</label>
                            <input type="text" id="name-${criterion.id}" placeholder="Contoh: Sangat Baik" 
                                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                        </div>
                        <div class="w-full sm:w-32 relative">
                            <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nilai</label>
                            <input type="number" step="0.01" id="value-${criterion.id}" placeholder="90" 
                                class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                        </div>
                        <button onclick="addParameter(${criterion.id})" 
                            class="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap">
                            <i data-lucide="plus" class="w-4 h-4 inline-block mr-1"></i> Tambah
                        </button>
                    </div>

                    <!-- Params List -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                                <tr>
                                    <th class="px-4 py-2 font-semibold">Nama Parameter</th>
                                    <th class="px-4 py-2 font-semibold text-right">Nilai</th>
                                    <th class="px-4 py-2 font-semibold text-center w-20">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                ${params.length ? params.map(p => `
                                    <tr class="hover:bg-slate-50">
                                        <td class="px-4 py-3 font-medium text-slate-700">${p.name}</td>
                                        <td class="px-4 py-3 text-right font-mono text-slate-600">${Number(p.value)}</td>
                                        <td class="px-4 py-3 text-center">
                                            <button onclick="deleteParameter(${p.id})" class="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join("") : `<tr><td colspan="3" class="px-4 py-4 text-center text-slate-400 italic">Belum ada parameter</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
        
        lucide.createIcons();

    } catch (e) {
        container.innerHTML = `<div class="text-center py-12 text-red-500">Gagal memuat data: ${e.message}</div>`;
    }
}

async function addParameter(criteriaId) {
    const nameInput = document.getElementById(`name-${criteriaId}`);
    const valueInput = document.getElementById(`value-${criteriaId}`);
    
    const name = nameInput.value.trim();
    const value = valueInput.value;

    if (!name || value === "") {
        showAlert("Nama dan Nilai wajib diisi!", "danger");
        return;
    }

    try {
        const res = await fetch(`/api/criteria/${criteriaId}/parameters`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, value })
        });
        const out = await res.json();
        
        if (out.status === "created") {
            showAlert("Parameter berhasil ditambahkan");
            loadData(); // Reload all (not optimal but simple)
        } else {
            showAlert("Gagal menambah parameter", "danger");
        }
    } catch (e) {
        showAlert("Error: " + e.message, "danger");
    }
}

async function deleteParameter(id) {
    if (!confirm("Hapus parameter ini?")) return;
    
    try {
        const res = await fetch(`/api/parameters/${id}`, { method: "DELETE" });
        const out = await res.json();
        
        if (out.status === "deleted") {
            showAlert("Parameter dihapus");
            loadData();
        } else {
            showAlert("Gagal menghapus parameter", "danger");
        }
    } catch (e) {
        showAlert("Error: " + e.message, "danger");
    }
}

document.addEventListener("DOMContentLoaded", loadData);
document.getElementById("btnReload").addEventListener("click", loadData);
