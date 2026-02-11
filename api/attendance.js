import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  // CASO 1: Obtener datos (GET)
  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM attendance ORDER BY created_at DESC LIMIT 100`;
      
      if (req.query.format === 'html') {
          let html = "<h1>Registro de Asistencia</h1><table border='1'><tr><th>Fecha</th><th>Hora</th><th>Tipo</th><th>Nombre</th><th>TNE</th></tr>";
          data.forEach(row => {
              html += `<tr><td>${row.date}</td><td>${row.hour}</td><td>${row.type}</td><td>${row.name}</td><td>${row.tne}</td></tr>`;
          });
          html += "</table>";
          res.setHeader('Content-Type', 'text/html');
          return res.status(200).send(html);
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // CASO 2: Enviar asistencia (POST)
  if (req.method === 'POST') {
    try {
      const { date, hour, type, name, tne } = req.body;
      await sql`
        INSERT INTO attendance (date, hour, type, name, tne)
        VALUES (${date}, ${hour}, ${type}, ${name}, ${tne})
      `;
      return res.status(200).json({ success: true, message: "Guardado en Neon" });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // NUEVO CASO 3: Eliminar todos los registros (DELETE)
  if (req.method === 'DELETE') {
    try {
      // Usamos TRUNCATE porque es más rápido para vaciar tablas completas
      await sql`TRUNCATE TABLE attendance`;
      return res.status(200).json({ success: true, message: "Base de datos vaciada correctamente" });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // Si se intenta otro método (PUT, PATCH, etc)
  return res.status(405).json({ message: "Método no permitido" });
}
