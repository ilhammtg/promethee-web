function showAlert(msg, type = "success") {
    const box = document.getElementById("alertBox");
    const color = type === "danger" ? "red" : "green";
    box.className = `p-4 mb-4 rounded-lg bg-${color}-50 text-${color}-700 border border-${color}-200`;
    box.textContent = msg;
    box.classList.remove("hidden");
    setTimeout(() => box.classList.add("hidden"), 2500);
}

function setFormModeEdit(item) {
    document.getElementById("formTitle").textContent = "Edit Kriteria";
    document.getElementById("criteriaId").value = item.id;
    document.getElementById("code").value = item.code ?? "";
    document.getElementById("name").value = item.name ?? "";
    document.getElementById("weight").value = item.weight ?? 0;
    document.getElementById("type").value = item.type ?? "benefit";
}

function resetForm() {
    document.getElementById("formTitle").textContent = "Tambah Kriteria";
    document.getElementById("criteriaId").value = "";
    document.getElementById("code").value = "";
    document.getElementById("name").value = "";
    document.getElementById("weight").value = "";
    document.getElementById("type").value = "benefit";
}


// =========================
// PARAMETER MANAGEMENT
// =========================

const paramModal = document.getElementById("paramModal");
const btnCloseParamModal = document.getElementById("btnCloseParamModal");
const btnSaveParam = document.getElementById("btnSaveParam");

function openParamModal(criteria) {
    document.getElementById("paramModalTitle").textContent = `Atur Parameter: ${criteria.name}`;
    document.getElementById("paramCriteriaId").value = criteria.id;
    document.getElementById("paramName").value = "";
    document.getElementById("paramValue").value = "";
    
    paramModal.classList.remove("hidden");
    paramModal.classList.add("flex");
    loadParameters(criteria.id);
}

function closeParamModal() {
    paramModal.classList.add("hidden");
    paramModal.classList.remove("flex");
}

btnCloseParamModal.addEventListener("click", closeParamModal);

async function loadParameters(criteriaId) {
    const tbody = document.getElementById("paramRows");
    tbody.innerHTML = `<tr><td colspan="3" class="px-4 py-4 text-center text-slate-500">Memuat...</td></tr>`;
    
    try {
        const res = await fetch(`/api/criteria/${criteriaId}/parameters`);
        const data = await res.json();
        const rows = data.parameters || [];
        
        if (!rows.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="px-4 py-4 text-center text-slate-500">Belum ada parameter.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = rows.map(p => `
            <tr class="hover:bg-slate-50">
                <td class="px-4 py-2 font-medium text-slate-700">${p.name}</td>
                <td class="px-4 py-2 text-right font-mono text-slate-600">${Number(p.value)}</td>
                <td class="px-4 py-2 text-center">
                    <button class="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors" onclick="deleteParameter(${p.id})">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join("");
        
        // Re-init icons if needed, but simple SVG is better here for dynamic content or assume lucide is global
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="3" class="px-4 py-4 text-center text-red-500">Error loading data.</td></tr>`;
    }
}

async function saveParameter() {
    const cid = document.getElementById("paramCriteriaId").value;
    const name = document.getElementById("paramName").value.trim();
    const value = document.getElementById("paramValue").value;
    
    if (!name || value === "") return alert("Nama dan Nilai wajib diisi!");
    
    const res = await fetch(`/api/criteria/${cid}/parameters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value })
    });
    
    const out = await res.json();
    if (out.status === "created") {
        document.getElementById("paramName").value = "";
        document.getElementById("paramValue").value = "";
        loadParameters(cid);
    } else {
        alert("Gagal menambah parameter");
    }
}

btnSaveParam.addEventListener("click", saveParameter);

async function deleteParameter(id) {
    if (!confirm("Hapus parameter ini?")) return;
    const cid = document.getElementById("paramCriteriaId").value;
    
    const res = await fetch(`/api/parameters/${id}`, { method: "DELETE" });
    const out = await res.json();
    
    if (out.status === "deleted") {
        loadParameters(cid);
    } else {
        alert("Gagal menghapus parameter");
    }
}
// Make accessible globally
window.deleteParameter = deleteParameter;


async function loadCriteria() {
    const res = await fetch("/api/criteria");
    const data = await res.json();
    const rows = data.criteria || [];

    // total bobot
    const total = rows.reduce((acc, x) => acc + Number(x.weight || 0), 0);
    document.getElementById("totalWeight").textContent = total.toFixed(2);

    const tbody = document.getElementById("rows");
    if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Belum ada kriteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(item => `
    <tr>
      <td class="text-center font-medium text-slate-600">${item.id}</td>
      <td class="text-center font-semibold text-slate-800">${item.code ?? ""}</td>
      <td class="text-slate-700">${item.name ?? ""}</td>
      <td class="text-right font-mono text-slate-600">${Number(item.weight).toFixed(2)}</td>
      <td class="text-center">
        <span class="px-2 py-1 text-xs rounded-full ${item.type === 'benefit' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} font-medium capitalize">
            ${item.type}
        </span>
      </td>
      <td class="text-center">
        <button class="px-2 py-1 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded hover:bg-blue-100 transition-colors mr-1" data-action="param" data-id="${item.id}">Atur Param</button>
        <button class="px-2 py-1 text-xs font-medium text-primary-600 border border-primary-200 bg-primary-50 rounded hover:bg-primary-100 transition-colors mr-1" data-action="edit" data-id="${item.id}">Edit</button>
        <button class="px-2 py-1 text-xs font-medium text-red-600 border border-red-200 bg-red-50 rounded hover:bg-red-100 transition-colors" data-action="delete" data-id="${item.id}">Hapus</button>
      </td>
    </tr>
  `).join("");

    // event delegation
    tbody.querySelectorAll("button[data-action='edit']").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const found = rows.find(r => r.id === id);
            if (found) setFormModeEdit(found);
        });
    });

    tbody.querySelectorAll("button[data-action='param']").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const found = rows.find(r => r.id === id);
            if (found) openParamModal(found);
        });
    });

    tbody.querySelectorAll("button[data-action='delete']").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.id);
            if (!confirm("Yakin hapus kriteria ini?")) return;
            const res = await fetch(`/api/criteria/${id}`, { method: "DELETE" });
            const out = await res.json();
            if (out.status === "deleted") {
                showAlert("Kriteria dihapus", "success");
                resetForm();
                loadCriteria();
            } else {
                showAlert("Gagal menghapus", "danger");
            }
        });
    });
}

async function saveCriteria() {
    const id = document.getElementById("criteriaId").value.trim();
    const payload = {
        code: document.getElementById("code").value.trim(),
        name: document.getElementById("name").value.trim(),
        weight: document.getElementById("weight").value,
        type: document.getElementById("type").value
    };

    if (!payload.name) return showAlert("Nama kriteria wajib diisi", "danger");
    if (payload.weight === "" || isNaN(Number(payload.weight))) return showAlert("Bobot wajib angka", "danger");

    if (!id) {
        const res = await fetch("/api/criteria", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const out = await res.json();
        if (out.status === "created") {
            showAlert("Kriteria ditambahkan", "success");
            resetForm();
            loadCriteria();
        } else showAlert("Gagal tambah kriteria", "danger");
    } else {
        const res = await fetch(`/api/criteria/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const out = await res.json();
        if (out.status === "updated") {
            showAlert("Kriteria diperbarui", "success");
            resetForm();
            loadCriteria();
        } else showAlert("Gagal update kriteria", "danger");
    }
}

document.getElementById("btnSave").addEventListener("click", saveCriteria);
document.getElementById("btnReset").addEventListener("click", resetForm);
document.getElementById("btnReload").addEventListener("click", loadCriteria);

loadCriteria();
