const { createClient } = require('@libsql/client');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    const { username, password } = req.body;
    try {
        const result = await client.execute({
            sql: 'SELECT password FROM users WHERE username = ?',
            args: [username]
        });
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        const match = await bcrypt.compare(password, result.rows[0].password);
        if (match) {
            res.json({ message: 'Inicio de sesión exitoso' });
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
};
