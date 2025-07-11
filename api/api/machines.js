const { createClient } = require('@libsql/client');

module.exports = async (req, res) => {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    try {
        if (req.method === 'GET') {
            const result = await client.execute('SELECT * FROM machines');
            res.json(result.rows);
        } else if (req.method === 'POST') {
            const { part_number, lower_limit, upper_limit } = req.body;
            const nominal = (parseFloat(lower_limit) + parseFloat(upper_limit)) / 2;
            await client.execute({
                sql: 'UPDATE machines SET part_number = ?, lower_limit = ?, upper_limit = ?, nominal = ? WHERE id = ?',
                args: [part_number, lower_limit, upper_limit, nominal, req.query.id]
            });
            res.json({ message: 'Límites establecidos correctamente' });
        } else {
            res.status(405).json({ message: 'Método no permitido' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
};
