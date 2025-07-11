const { createClient } = require('@libsql/client');

module.exports = async (req, res) => {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    try {
        if (req.method === 'GET') {
            const result = await client.execute({
                sql: 'SELECT measurement, timestamp FROM measurements WHERE machine_id = ? ORDER BY timestamp DESC LIMIT 10',
                args: [req.query.machine_id]
            });
            res.json(result.rows);
        } else if (req.method === 'POST') {
            const { machine_id, measurement } = req.body;
            const timestamp = new Date().toISOString();
            await client.execute({
                sql: 'INSERT INTO measurements (machine_id, measurement, timestamp) VALUES (?, ?, ?)',
                args: [machine_id, measurement, timestamp]
            });
            res.json({ message: 'Medición registrada correctamente' });
        } else {
            res.status(405).json({ message: 'Método no permitido' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
};
