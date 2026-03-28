<script>
    export let data;
    // Extracting the Quantum insights from Nia's API
    $: branch = data.quantum?.branch_taken || "Scanning...";
    $: score = data.quantum?.quantum_score || 0;
    $: totalRaised = data.strikes.reduce((acc, s) => acc + s.amount, 0);
    $: goal = 50000;
    $: percent = Math.min((totalRaised / goal) * 100, 100);

    // Color logic based on Nia's current Branch
    $: statusColor = branch === "Aggressive Strike" ? "text-red-500" : "text-green-400";
    $: barColor = branch === "Aggressive Strike" ? "bg-red-600" : "bg-blue-500";
</script>

<main class="p-6 bg-slate-950 text-white min-h-screen font-mono">
    <div class="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 class="text-xl font-bold tracking-tighter">NIA-EVO // SOVEREIGN_NEXUS</h1>
        <div class="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">
            ALPHA_V1.2
        </div>
    </div>

    <div class="mb-6 p-4 bg-slate-900 rounded-lg border-l-4 border-blue-500">
        <div class="text-xs text-slate-500 uppercase tracking-widest mb-1">Active Quantum Branch</div>
        <div class="text-2xl font-bold {statusColor}">{branch}</div>
        <div class="text-xs text-slate-400 mt-2">Probability Score: {score}</div>
    </div>

    <div class="mb-8 p-4 bg-slate-900 rounded-lg border border-slate-800">
        <div class="flex justify-between mb-3 text-sm">
            <span class="text-slate-400">Grant Strike Goal</span>
            <span class="font-bold">{percent.toFixed(1)}%</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div class="{barColor} h-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                 style="width: {percent}%"></div>
        </div>
        <div class="flex justify-between mt-3 text-[10px] text-slate-500 uppercase">
            <span>Progress: ${totalRaised.toLocaleString()}</span>
            <span>Target: $50,000</span>
        </div>
    </div>

    <h2 class="text-xs text-slate-500 uppercase tracking-widest mb-4">Live Strike Ledger</h2>
    <div class="grid gap-3">
        {#each data.strikes as strike}
            <div class="p-4 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                <div>
                    <div class="text-blue-400 text-sm font-bold uppercase">{strike.agency}</div>
                    <div class="text-xs text-slate-500">{strike.status}</div>
                </div>
                <div class="text-lg font-bold">${strike.amount.toLocaleString()}</div>
            </div>
        {/each}
    </div>
</main>
