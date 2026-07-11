import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. Chatbot will run in simulation fallback mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "orders.json");

app.use(express.json());

// Initialize local database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  const initialOrders = [
    {
      id: "PED-8421",
      customerName: "María López",
      customerPhone: "4433383043",
      customerEmail: "maria.lopez@example.com",
      serviceType: "Impresiones Fotográficas",
      options: {
        copies: 5,
        paperType: "Fotográfico Brillante",
        size: "4x6 pulgadas",
        colorMode: "Color",
        sides: "Una cara",
        instructions: "Por favor recortar bordes blancos si es necesario."
      },
      fileName: "vacaciones_familia.jpg",
      fileSize: "2.4 MB",
      totalPrice: 75.00,
      status: "Entregado",
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "PED-9102",
      customerName: "Carlos Mendoza",
      customerPhone: "4431234567",
      customerEmail: "carlos.m@example.com",
      serviceType: "Impresión Opalina",
      options: {
        copies: 20,
        paperType: "Opalina 225g",
        size: "Carta",
        colorMode: "Color",
        sides: "Una cara",
        instructions: "Imprimir las portadas del portafolio académico."
      },
      fileName: "portada_proyecto_final.pdf",
      fileSize: "12.8 MB",
      totalPrice: 240.00,
      status: "Listo para entrega",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "PED-4029",
      customerName: "Sofía Martínez",
      customerPhone: "4439876543",
      customerEmail: "sofia.mtz@example.com",
      serviceType: "Tarjetas de Presentación",
      options: {
        copies: 100,
        paperType: "Opalina 225g",
        size: "9x5 cm (tarjeta)",
        colorMode: "Color",
        sides: "Ambas caras",
        instructions: "Tarjetas de diseño de consultoría de belleza."
      },
      fileName: "diseño_tarjeta_sofia.pdf",
      fileSize: "4.1 MB",
      totalPrice: 180.00,
      status: "En proceso",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "PED-7312",
      customerName: "Juan Pérez",
      customerPhone: "4435551212",
      customerEmail: "juan.perez@example.com",
      serviceType: "Copias",
      options: {
        copies: 50,
        paperType: "Normal 75g",
        size: "Carta",
        colorMode: "Blanco y Negro",
        sides: "Una cara",
        instructions: "Copias del temario de física."
      },
      fileName: "temario_fisica.pdf",
      fileSize: "1.5 MB",
      totalPrice: 50.00,
      status: "Pendiente",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ];
  fs.writeFileSync(DB_FILE, JSON.stringify(initialOrders, null, 2), "utf8");
}

// Read helper
const readOrders = (): any[] => {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file:", error);
    return [];
  }
};

// Write helper
const writeOrders = (orders: any[]) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
};

// --- API ROUTES ---

// Get all orders
app.get("/api/orders", (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

// Get a specific order by ID
app.get("/api/orders/:id", (req, res) => {
  const orders = readOrders();
  const order = orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Pedido no encontrado" });
  }
});

// Create a new order
app.post("/api/orders", (req, res) => {
  const { customerName, customerPhone, customerEmail, serviceType, options, fileName, fileSize, totalPrice } = req.body;

  if (!customerName || !customerPhone || !serviceType || !totalPrice) {
    return res.status(400).json({ message: "Campos requeridos incompletos" });
  }

  const orders = readOrders();
  
  // Generate a random 4 digit number that doesn't conflict
  let randomNum = Math.floor(1000 + Math.random() * 9000);
  let id = `PED-${randomNum}`;
  while (orders.some((o) => o.id === id)) {
    randomNum = Math.floor(1000 + Math.random() * 9000);
    id = `PED-${randomNum}`;
  }

  const newOrder = {
    id,
    customerName,
    customerPhone,
    customerEmail: customerEmail || "",
    serviceType,
    options: {
      copies: Number(options.copies) || 1,
      paperType: options.paperType || "Normal 75g",
      size: options.size || "Carta",
      colorMode: options.colorMode || "Color",
      sides: options.sides || "Una cara",
      instructions: options.instructions || ""
    },
    fileName: fileName || null,
    fileSize: fileSize || null,
    totalPrice: Number(totalPrice),
    status: "Pendiente",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orders.push(newOrder);
  writeOrders(orders);

  res.status(201).json(newOrder);
});

// Update order status
app.put("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Estado es requerido" });
  }

  const validStatuses = ["Pendiente", "En proceso", "Listo para entrega", "Entregado", "Cancelado"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  const orders = readOrders();
  const orderIndex = orders.findIndex((o) => o.id.toLowerCase() === req.params.id.toLowerCase());

  if (orderIndex !== -1) {
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    writeOrders(orders);
    res.json(orders[orderIndex]);
  } else {
    res.status(404).json({ message: "Pedido no encontrado" });
  }
});

// Delete an order
app.delete("/api/orders/:id", (req, res) => {
  const orders = readOrders();
  const filteredOrders = orders.filter((o) => o.id.toLowerCase() !== req.params.id.toLowerCase());

  if (filteredOrders.length !== orders.length) {
    writeOrders(filteredOrders);
    res.json({ message: "Pedido eliminado correctamente" });
  } else {
    res.status(404).json({ message: "Pedido no encontrado" });
  }
});

// Get statistics for dashboard
app.get("/api/stats", (req, res) => {
  const orders = readOrders();
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "Pendiente").length,
    inProcessOrders: orders.filter((o) => o.status === "En proceso").length,
    readyOrders: orders.filter((o) => o.status === "Listo para entrega").length,
    completedOrders: orders.filter((o) => o.status === "Entregado").length,
    totalRevenue: orders
      .filter((o) => o.status !== "Cancelado")
      .reduce((sum, o) => sum + o.totalPrice, 0)
  };
  res.json(stats);
});

// AI Chatbot endpoint for information about services
app.post("/api/chat", async (req, res) => {
  const { contents } = req.body;
  if (!contents || !Array.isArray(contents)) {
    return res.status(400).json({ message: "El historial 'contents' es requerido y debe ser una lista." });
  }

  const systemInstruction = `Eres "Rosita", la asistente virtual e inteligente de "Copias & Impresiones Queréndaro", ubicada en Av. del Trabajo S/N, Queréndaro, Michoacán.

Tu objetivo es atender a los clientes con calidez, entusiasmo, amabilidad y de forma clara y directa, adaptándote a nuestro hermoso estilo visual "Clean Minimalism" rosa y blanco.

Aquí está la información oficial de la tienda y los servicios para responder con precisión:

1. UBICACIÓN Y CONTACTO:
   - Dirección: Av. del Trabajo S/N, Queréndaro, Michoacán.
   - WhatsApp / Teléfono: 443 338 3043.
   - Horarios de atención: Lunes a Viernes de 10:00 AM a 8:30 PM, Sábados de 9:00 AM a 4:00 PM, Domingos cerrado.

2. SERVICIOS Y PRECIOS OFICIALES:
   - Impresiones a Color (Desde $5.0 MXN): Papel Normal 75g, Opalina 125g, Opalina 225g. Tamaños Carta, Oficio, A4. Impresión ultra-HD de alta nitidez.
   - Impresiones Fotográficas (Desde $30.0 MXN): Papel Fotográfico Premium Brillante o Mate. Tamaños 4x6 pulgadas, 5x7 pulgadas, Carta. Una sola cara.
   - Impresiones Opalina (Desde $12.0 MXN): Papel Opalina 125g o 225g para invitaciones, diplomas, portadas y certificados. Tamaños Carta y Oficio. Una o ambas caras.
   - Impresión de Etiquetas (Desde $20.0 MXN): Papel Autoadhesivo Brillante o Mate, listo para recortar y pegar. Tamaños Carta, A4.
   - Copias e Impresión B/N (Desde $1.0 MXN): Papel Normal 75g. Tamaños Carta y Oficio. Ideal para copias de volumen rápidas y económicas.
   - Tarjetas de Presentación (Desde $1.8 MXN): Papel Opalina 225g o Opalina 225g Texturizada. Tamaño estándar 9x5 cm. Una o ambas caras.

3. ¿CÓMO HACER UN PEDIDO?
   - Explica de forma sencilla:
     1. Ir a la pestaña de "Servicios" (haciendo clic en el menú superior).
     2. Seleccionar el servicio deseado y dar clic en el botón "Cotizar Pedido" de su tarjeta.
     3. Configurar las especificaciones del pedido (copias, tamaño, papel, etc.).
     4. Subir el archivo (PDF, JPG, PNG, etc.) y escribir instrucciones especiales si lo requiere.
     5. Al enviar el pedido, el sistema generará un Folio único (por ejemplo: PED-1234) que se guardará en la base de datos de Firebase.
     6. El cliente podrá rastrear el estatus del pedido ("Pendiente", "En proceso", "Listo para entrega", "Entregado") en tiempo real introduciendo su folio en la sección de consulta o con ayuda del chatbot.

4. NOVEDADES Y NOTICIAS RECIENTES (¡NUEVO!):
   - Cuando te pregunten por novedades, lanzamientos o noticias recientes de la tienda, comparte con entusiasmo estas fantásticas novedades:
     • 🚀 **Nueva Tarifa de Impresión Fotográfica Premium**: Hemos mejorado nuestra calidad a papel premium brillante o mate de grado galería por solo **$30.0 MXN** base.
     • 🏷️ **Etiquetas Autoadhesivas**: Ahora impresas en papel brillante o mate con colores deslumbrantes por solo **$20.0 MXN** base, ideales para tu negocio o proyectos escolares.
     • 📍 **Nueva Ubicación Oficial**: Estamos ubicados en **Av. del Trabajo S/N, Queréndaro, Michoacán** en unas instalaciones más amplias y modernas con equipo digital de punta.
     • 📅 **Horario Ampliado de Lunes a Viernes**: Pensando en tu comodidad, ahora abrimos de **10:00 AM a 8:30 PM** de Lunes a Viernes. Los Sábados te esperamos en nuestro horario habitual de 9:00 AM a 4:00 PM.
     • 💻 **Pedidos Modernos en Línea**: Ahora puedes cotizar, configurar y subir tus archivos PDF, fotos o documentos directamente desde este navegador web. ¡Evita filas y recoge cuando tu estatus diga listo!

5. PROMOCIONES ACTIVAS:
   - Por el momento no contamos con descuentos activos, pero garantizamos los mejores precios de Queréndaro en impresiones y copias de excelente calidad.

6. REGLAS DE COMPORTAMIENTO:
   - Sé muy amable, alegre y responde siempre en español.
   - Mantén tus respuestas relativamente cortas, amigables y bien estructuradas usando viñetas o negritas para facilitar la lectura rápida.
   - No inventes servicios ni precios que no estén en la lista anterior.
   - Usa un tono alegre, servicial e inteligente.`;

  const ai = getAiClient();

  if (!ai) {
    // Simulated Offline Fallback
    const lastUserMessage = contents[contents.length - 1]?.parts?.[0]?.text || "";
    const query = lastUserMessage.toLowerCase();
    let text = "";

    if (query.includes("precio") || query.includes("costo") || query.includes("cuanto") || query.includes("valora")) {
      text = "¡Hola! Con mucho gusto te comparto nuestros precios desde:\n\n" +
        "• **Copias e Impresión B/N**: Desde **$1.0 MXN**\n" +
        "• **Tarjetas de Presentación**: Desde **$1.8 MXN**\n" +
        "• **Impresiones a Color**: Desde **$5.0 MXN**\n" +
        "• **Impresión de Etiquetas**: Desde **$20.0 MXN**\n" +
        "• **Impresiones Opalina**: Desde **$12.0 MXN**\n" +
        "• **Impresiones Fotográficas**: Desde **$30.0 MXN**\n\n" +
        "¡Puedes consultar todos los detalles y cotizar en la sección de **Servicios**!";
    } else if (query.includes("ubica") || query.includes("donde") || query.includes("direcc") || query.includes("como llegar")) {
      text = "¡Hola! Nos encontramos en una ubicación excelente y muy accesible en Queréndaro:\n\n" +
        "📍 **Av. del Trabajo S/N, Queréndaro, Michoacán**\n\n" +
        "¡Te esperamos! Si tienes dudas para llegar nos puedes escribir por WhatsApp al **443 338 3043**.";
    } else if (query.includes("hora") || query.includes("abier") || query.includes("sabado") || query.includes("domingo") || query.includes("tiempo")) {
      text = "¡Hola! Te comparto nuestros horarios de servicio:\n\n" +
        "• 📅 **Lunes a Viernes**: 10:00 AM - 8:30 PM\n" +
        "• 📅 **Sábados**: 9:00 AM - 4:00 PM\n" +
        "• 📅 **Domingos**: Cerrado\n\n" +
        "¡Estamos listos para atenderte dentro de estos horarios!";
    } else if (query.includes("pedido") || query.includes("comprar") || query.includes("cotiz") || query.includes("hacer") || query.includes("como")) {
      text = "¡Hacer un pedido con nosotros es súper sencillo e inmediato!\n\n" +
        "1. Ve a la sección **Servicios** en el menú superior.\n" +
        "2. Elige el servicio de tu preferencia y presiona **Cotizar Pedido**.\n" +
        "3. Rellena las especificaciones de impresión y sube tu archivo (PDF, JPG, etc.).\n" +
        "4. Al enviar el pedido, recibirás un **Folio** único que podrás ingresar en nuestro buscador para rastrear tu producción en tiempo real.\n\n" +
        "¡Todo el proceso es 100% en línea y rápido!";
    } else if (query.includes("novedad") || query.includes("nuevo") || query.includes("noticia") || query.includes("que hay de nuevo") || query.includes("lanzamiento")) {
      text = "¡Hola! Tenemos excelentes **Novedades y Lanzamientos** en Copias & Impresiones Queréndaro:\n\n" +
        "• 🚀 **Fotos Premium ($30.0 MXN)**: Ahora con calidad de galería profesional en papel premium brillante/mate.\n" +
        "• 🏷️ **Etiquetas Autoadhesivas ($20.0 MXN)**: Listas para recortar y pegar, ideales para tu negocio o tareas.\n" +
        "• 📍 **Nueva Ubicación**: Te esperamos en nuestras amplias oficinas en **Av. del Trabajo S/N, Queréndaro, Michoacán**.\n" +
        "• 📅 **Nuevo Horario Ampliado**: Lunes a Viernes de **10:00 AM a 8:30 PM** para facilitarte el paso después del trabajo o escuela.\n" +
        "• 💻 **Cotizador y Pedido Digital**: Recuerda que puedes subir tus archivos y realizar tus pedidos 100% en línea desde este navegador web.\n\n" +
        "¿Hay algo de esto sobre lo que quieras saber más?";
    } else if (query.includes("descuento") || query.includes("promo") || query.includes("oferta")) {
      text = "Actualmente no contamos con descuentos por volumen activos, pero te garantizamos la mejor relación calidad-precio de todo Queréndaro en todos tus pedidos.";
    } else {
      text = "¡Hola! Soy **Rosita**, tu asesora virtual de Copias & Impresiones Queréndaro. 🌸\n\n" +
        "Puedo proporcionarte información sobre nuestras **novedades**, **precios**, **horarios**, **ubicación** o explicarte **cómo hacer un pedido**.\n\n" +
        "¿En qué te puedo ayudar el día de hoy?";
    }

    return res.json({ text });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ message: "Error al procesar el mensaje con Gemini.", details: error.message });
  }
});

// --- VITE DEV SERVER OR STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
