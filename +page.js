export const load = async ({ fetch }) => {
    // Calling your live Render engine
    const response = await fetch('https://nia-evo.onrender.com/strikes');
    const data = await response.json();
    return { strikes: data.top_strikes };
};
