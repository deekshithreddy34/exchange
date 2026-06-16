import { Client } from 'pg';

const client = new Client({
    user: process.env.DB_USER || 'your_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'my_database',
    password: process.env.DB_PASSWORD || 'your_password',
    port: Number(process.env.DB_PORT) || 5432,
});

// Generates realistic price series using a random walk
function generatePriceSeries(startPrice: number, count: number, volatility: number): number[] {
    const prices: number[] = [startPrice];
    for (let i = 1; i < count; i++) {
        const change = (Math.random() - 0.48) * volatility;
        const next = Math.max(prices[i - 1] + change, startPrice * 0.5);
        prices.push(parseFloat(next.toFixed(2)));
    }
    return prices;
}

async function seedData() {
    await client.connect();
    console.log('Connected to database');

    // Clear existing data
    await client.query(`DELETE FROM tata_prices`);
    console.log('Cleared existing tata_prices data');

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // One trade every 30 seconds for 7 days = ~20160 rows
    const intervalMs = 30 * 1000;
    const totalPoints = Math.floor((now - sevenDaysAgo) / intervalMs);

    const startPrice = 1000;
    const prices = generatePriceSeries(startPrice, totalPoints, 2.5);

    console.log(`Inserting ${totalPoints} trade rows over 7 days...`);

    const batchSize = 500;
    for (let i = 0; i < totalPoints; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, totalPoints); j++) {
            const ts = new Date(sevenDaysAgo + j * intervalMs);
            const price = prices[j];
            const volume = parseFloat((0.5 + Math.random() * 4.5).toFixed(4));
            batch.push(`('${ts.toISOString()}', ${price}, ${volume}, 'INR')`);
        }
        await client.query(`
            INSERT INTO tata_prices (time, price, volume, currency_code)
            VALUES ${batch.join(', ')}
        `);

        if ((i / batchSize) % 10 === 0) {
            console.log(`  ${Math.min(i + batchSize, totalPoints)}/${totalPoints} rows inserted`);
        }
    }

    console.log('Refreshing materialized views...');
    await client.query('REFRESH MATERIALIZED VIEW klines_1m');
    await client.query('REFRESH MATERIALIZED VIEW klines_1h');
    await client.query('REFRESH MATERIALIZED VIEW klines_1w');

    console.log('Done! Chart data is ready.');
    await client.end();
}

seedData().catch(console.error);
