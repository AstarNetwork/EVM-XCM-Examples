export async function waitFor(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}