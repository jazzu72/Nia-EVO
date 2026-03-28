<script>
    export let data;
    $: branch = data.quantum?.branch_taken || "Ghost-Mirror Active";
    $: score = data.quantum?.quantum_score || 0.945;
    $: totalRaised = data.strikes.reduce((acc, s) => acc + s.amount, 0);
</script>

<main class="p-6 bg-slate-950 text-white min-h-screen font-mono">
    <div class="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 class="text-xl font-bold tracking-tighter">NIA-EVO // SOVEREIGN_NEXUS</h1>
        <div class="text-xs px-2 py-1 rounded bg-blue-900 border border-blue-700 text-blue-200 animate-pulse">
            GHOST-MIRROR_ENABLED
        </div>
    </div>

    <div class="mb-6 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)]">
        <div class="flex justify-between items-center text-[10px] uppercase tracking-widest text-yellow-500 mb-2">
            <span>Whale Strike Detected</span>
            <span>JULY 15, 2026</span>
        </div>
        <div class="text-3xl font-black text-white">$275,000.00</div>
        <div class="text-[10px] text-slate-400 mt-1 uppercase">Genesis Mission: Global Capability Expansion</div>
        <button class="mt-4 w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs uppercase rounded transition-all">
            Initiate Ghost-Mirror Simulation
        </button>
    </div>

    <div class="mb-6 p-4 bg-slate-900 rounded-lg border-l-4 border-blue-500">
        <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Quantum Strategy Branch</div>
        <div class="text-xl font-bold text-blue-400">{branch}</div>
        <div class="text-[10px] text-slate-400 mt-1">Mirror Confidence: {(score * 100).toFixed(1)}%</div>
    </div>

    <h2 class="text-xs text-slate-500 uppercase tracking-widest mb-4">Live Strike Ledger</h2>
    <div class="grid gap-3">
        {#each data.strikes as strike}
            <div class="p-4 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                <div>
                    <div class="text-blue-400 text-sm font-bold uppercase">{strike.agency}</div>
                    <div class="text-[10px] text-slate-500">{strike.status}</div>
                </div>
                <div class="text-lg font-bold">${strike.amount.toLocaleString()}</div>
            </div>
        {/each}
    </div>
</main>
