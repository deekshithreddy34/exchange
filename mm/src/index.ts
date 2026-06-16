import axios from "axios";

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const TOTAL_BIDS = 15;
const TOTAL_ASK = 15;
const USER_ID = "5";

const MARKETS: Record<string, { basePrice: number; spread: number }> = {
    "TATA_INR":     { basePrice: 1000,    spread: 1 },
    "BTC_INR":      { basePrice: 8500000, spread: 5000 },
    "ETH_INR":      { basePrice: 310000,  spread: 500 },
    "SOL_INR":      { basePrice: 13000,   spread: 50 },
};

async function manageMarket(market: string, basePrice: number, spread: number) {
    const price = basePrice + (Math.random() - 0.5) * spread * 2;
    const openOrders = await axios.get(`${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${market}`);

    const totalBids = openOrders.data.filter((o: any) => o.side === "buy").length;
    const totalAsks = openOrders.data.filter((o: any) => o.side === "sell").length;

    const cancelledBids = await cancelBidsMoreThan(openOrders.data, price, market);
    const cancelledAsks = await cancelAsksLessThan(openOrders.data, price, market);

    let bidsToAdd = TOTAL_BIDS - totalBids - cancelledBids;
    let asksToAdd = TOTAL_ASK - totalAsks - cancelledAsks;

    while (bidsToAdd > 0 || asksToAdd > 0) {
        if (bidsToAdd > 0) {
            await axios.post(`${BASE_URL}/api/v1/order`, {
                market,
                price: (price - Math.random() * spread).toFixed(1).toString(),
                quantity: "1",
                side: "buy",
                userId: USER_ID
            });
            bidsToAdd--;
        }
        if (asksToAdd > 0) {
            await axios.post(`${BASE_URL}/api/v1/order`, {
                market,
                price: (price + Math.random() * spread).toFixed(1).toString(),
                quantity: "1",
                side: "sell",
                userId: USER_ID
            });
            asksToAdd--;
        }
    }
}

async function cancelBidsMoreThan(openOrders: any[], price: number, market: string) {
    let promises: any[] = [];
    openOrders.filter(o => o.side === "buy" && (o.price > price || Math.random() < 0.1))
        .forEach(o => promises.push(axios.delete(`${BASE_URL}/api/v1/order`, { data: { orderId: o.orderId, market } })));
    await Promise.all(promises);
    return promises.length;
}

async function cancelAsksLessThan(openOrders: any[], price: number, market: string) {
    let promises: any[] = [];
    openOrders.filter(o => o.side === "sell" && (o.price < price || Math.random() < 0.5))
        .forEach(o => promises.push(axios.delete(`${BASE_URL}/api/v1/order`, { data: { orderId: o.orderId, market } })));
    await Promise.all(promises);
    return promises.length;
}

async function main() {
    for (const [market, { basePrice, spread }] of Object.entries(MARKETS)) {
        try {
            await manageMarket(market, basePrice, spread);
        } catch (e) {
            // ignore per-market errors
        }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    main();
}

main();
