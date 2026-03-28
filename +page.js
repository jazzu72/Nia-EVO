export const load = async ({ fetch }) => {
    const response = await fetch('PASTE_URL_HERE/strikes');
    const data = await response.json();
    return { strikes: data.top_strikes };
};
