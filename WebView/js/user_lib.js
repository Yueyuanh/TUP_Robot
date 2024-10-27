function delay_ms(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function delay(ms) {
    await delay_ms(ms); // 延迟2秒
}
