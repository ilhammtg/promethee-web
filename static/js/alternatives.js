function showAlert(msg, type = "success") {
    const box = document.getElementById("alertBox");
    const color = type === "danger" ? "red" : "green";
    box.className = `p-4 mb-4 rounded-lg bg-${color}-50 text-${color}-700 border border-${color}-200`;
    box.textContent = msg;
    box.classList.remove("hidden");
    setTimeout(() => box.classList.add("hidden"), 2500);
}

function setFormModeEdit(item) {
    document.getElementById("formTitle").textContent = "Edit Alternatif";
    document.getElementById("altId").value = item.id;
    document.getElementById("code").value = item.code ?? "";
    document.getElementById("name").value = item.name ?? "";
}

function resetForm() {
    document.getElementById("formTitle").textContent = "Tambah Alternatif";
    document.getElementById("altId").value = "";
    document.getElementById("code").value = "";
    document.getElementById("name").value = "";
}

async function loadAlternatives() {
    const res = await fetch("/api/alternatives");
    const data = await res.json();
    const rows = data.alternatives || [];

    const tbody = document.getElementById("rows");
    if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Belum ada alternatif.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(item => `
    <tr>
      <td class="text-center">${item.id}</td>
      <td class="text-center font-semibold text-slate-700">${item.code ?? ""}</td>
      <td>${item.name ?? ""}</td>
      <td class="text-center">
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

    tbody.querySelectorAll("button[data-action='delete']").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.id);
            if (!confirm("Yakin hapus alternatif ini?")) return;
            const res = await fetch(`/api/alternatives/${id}`, { method: "DELETE" });
            const out = await res.json();
            if (out.status === "deleted") {
                showAlert("Alternatif dihapus", "success");
                resetForm();
                loadAlternatives();
            } else {
                showAlert("Gagal menghapus", "danger");
            }
        });
    });
}

async function saveAlternative() {
    const id = document.getElementById("altId").value.trim();
    const payload = {
        code: document.getElementById("code").value.trim(),
        name: document.getElementById("name").value.trim()
    };

    if (!payload.name) return showAlert("Nama alternatif wajib diisi", "danger");

    if (!id) {
        const res = await fetch("/api/alternatives", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const out = await res.json();
        if (out.status === "created") {
            showAlert("Alternatif ditambahkan", "success");
            resetForm();
            loadAlternatives();
        } else showAlert("Gagal tambah alternatif", "danger");
    } else {
        const res = await fetch(`/api/alternatives/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const out = await res.json();
        if (out.status === "updated") {
            showAlert("Alternatif diperbarui", "success");
            resetForm();
            loadAlternatives();
        } else showAlert("Gagal update alternatif", "danger");
    }
}

document.getElementById("btnSave").addEventListener("click", saveAlternative);
document.getElementById("btnReset").addEventListener("click", resetForm);
document.getElementById("btnReload").addEventListener("click", loadAlternatives);

loadAlternatives();
