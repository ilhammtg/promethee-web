document.addEventListener("DOMContentLoaded", () => {
    loadStats();
    document.getElementById("btnRefreshStats").addEventListener("click", loadStats);
});

async function loadStats() {
    // Parallel fetch for speed
    try {
        const [resAlt, resCrit, resPat] = await Promise.all([
            fetch("/api/alternatives"),
            fetch("/api/criteria"),
            fetch("/api/patients") // This might fail if user didn't restart server yet, but that's ok to handle
        ]);

        const dataAlt = await resAlt.json();
        const dataCrit = await resCrit.json();

        let countPat = 0;
        if (resPat.ok) {
            const dataPat = await resPat.json();
            countPat = (dataPat.patients || []).length;
        }

        // Update UI
        document.getElementById("countAlternatives").textContent = (dataAlt.alternatives || []).length;
        document.getElementById("countCriteria").textContent = (dataCrit.criteria || []).length;
        document.getElementById("countPatients").textContent = countPat;

    } catch (e) {
        console.error("Failed to load stats", e);
    }
}
