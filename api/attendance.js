import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  
  // Seguridad: Verificar Token (La llave que creaste)
  const authToken = req.headers['x-api-key'];
  const secretToken = process.env.API_SECRET_TOKEN;

  if (!authToken || authToken !== secretToken) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }

  // GET: Obtener datos (QUITAMOS EL LIMIT 100)
  if (req.method === 'GET') {
    try {
      // Ordenamos por fecha y hora para que la App reciba los datos estructurados
      const data = await sql`SELECT * FROM attendance ORDER BY date DESC, hour DESC`;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Guardar registro
  if (req.method === 'POST') {
    try {
      const { date, hour, type, name, tne } = req.body;
      await sql`
        INSERT INTO attendance (date, hour, type, name, tne)
        VALUES (${date}, ${hour}, ${type}, ${name}, ${tne})
      `;
      return res.status(200).json({ success: true, message: "Guardado" });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE: Borrar todo (Este es el que usa el botón del basurero)
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM attendance`;
      return res.status(200).json({ success: true, message: "Base de datos limpiada" });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
