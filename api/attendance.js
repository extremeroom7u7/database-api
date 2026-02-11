import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Solo permitimos peticiones POST (como en tu script original)
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Conexión a Neon usando la variable de entorno
  const sql = neon(process.env.DATABASE_URL);

  try {
    const { date, hour, type, name, tne } = req.body;

    // Validación básica de que los datos llegaron
    if (!type || !name || !tne) {
      return res.status(400).json({ success: false, error: 'Missing data' });
    }

    // Insertar en la tabla de Neon
    await sql`
      INSERT INTO attendance (date, hour, type, name, tne)
      VALUES (${date}, ${hour}, ${type}, ${name}, ${tne})
    `;

    // Respuesta de éxito idéntica a la de Google para que la App no falle
    return res.status(200).json({
      success: true,
      message: "Attendance registered in Neon"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
