const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_0qkhmM5IJnSR@ep-dry-lake-af1mgbl1-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function wipe() {
    console.log('Connecting to Production Database...');
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected. Dropping public schema...');

        await client.query('DROP SCHEMA public CASCADE');
        await client.query('CREATE SCHEMA public');

        console.log('✅ Public schema recreated successfully.');
    } catch (e) {
        console.error('❌ Error wiping database:', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

wipe();
