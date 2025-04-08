const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Asegúrate de importar tu modelo User

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token missing' });

    const token = authHeader.split(' ')[1];
    try {
        // Verifica y decodifica el token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Busca al usuario en la base de datos usando el ID decodificado
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Pasa el objeto completo del usuario a req.user
        req.user = user;
        next(); // Pasa al siguiente middleware o función
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};