export const load = async ({ fetch }) => {
    // Nia-EVO: Connecting to the live Render Engine
    const response = await fetch('https://nia-evo.onrender.com/strikes');
    const data = await response.json();
    return { strikes: data.top_strikes };
};
