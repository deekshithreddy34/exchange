import { Client } from 'pg';
import { createClient } from 'redis';  
import { DbMessage } from './types';

const pgClient = new Client({
    user: process.env.DB_USER || 'your_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'my_database',
    password: process.env.DB_PASSWORD || 'your_password',
    port: Number(process.env.DB_PORT) || 5432,
});
pgClient.connect();

async function main() {
    const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    await redisClient.connect();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("db_processor" as string)
        if (!response) {

        }  else {
            const data: DbMessage = JSON.parse(response);
            if (data.type === "TRADE_ADDED") {
                console.log("adding data");
                console.log(data);
                const price = data.data.price;
                const timestamp = new Date(data.data.timestamp);
                const query = 'INSERT INTO tata_prices (time, price, volume) VALUES ($1, $2, $3)';
                const values = [timestamp, price, data.data.quantity];
                await pgClient.query(query, values);
            }
        }
    }

}

main();