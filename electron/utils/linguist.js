import linguist from 'linguist-js';
export async function analyzeFolder(folderPath) {
    // Analyse folder on disc
    const options = { keepVendored: false, quick: false, json: true };
    // Annotate the response of linguist function
    const { files, languages, unknown } = await linguist(folderPath, options);
    return { files, languages, unknown };
}
