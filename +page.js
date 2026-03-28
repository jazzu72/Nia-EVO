export const load = async ({ fetch }) => {
    // UPDATED with your actual Render URL
    const response = await fetch('YOUR_URL/strikes');
    const data = await response.json();
    return { strikes: data.top_strikes };
};
