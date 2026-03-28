<script>
    export let data;
    // Calculate total progress based on your Grant targets
    $: totalRaised = data.strikes.reduce((acc, s) => acc + s.amount, 0);
    $: goal = 50000; // Your House of Jazzu Phase 1 Target
    $: percent = Math.min((totalRaised / goal) * 100, 100);
</script>

<main class="p-6 bg-slate-900 text-white min-h-screen">
    <h1 class="text-2xl font-bold mb-4">Nia-EVO: Sovereign Nexus</h1>
    
    <div class="mb-8 bg-slate-800 p-4 rounded-lg border border-blue-500">
        <div class="flex justify-between mb-2">
            <span>Grant Funding Progress</span>
            <span>{percent.toFixed(1)}%</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-4">
            <div class="bg-blue-500 h-4 rounded-full transition-all duration-500" 
                 style="width: {percent}%"></div>
        </div>
        <p class="mt-2 text-sm text-gray-400">Target: $50,000 | Current: ${totalRaised.toLocaleString()}</p>
    </div>

    <div class="grid gap-4">
        {#each data.strikes as strike}
            <div class="p-4 bg-slate-800 rounded border border-gray-700">
                <div class="font-bold text-blue-400">{strike.agency}</div>
                <div class="text-xl">${strike.amount.toLocaleString()}</div>
                <div class="text-xs text-gray-500 uppercase">{strike.status}</div>
            </div>
        {/each}
    </div>
</main>
