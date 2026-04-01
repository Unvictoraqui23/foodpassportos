import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const DB_FILE = './db.json';

// Initial state if file doesn't exist
const initialState = {
  tables: [],
  orders: [],
  history: [],
  tips: {},
  pendingCaja: {},
  lastUpdate: 0
};

function readDB() {
  if (!existsSync(DB_FILE)) return initialState;
  try {
    const data = readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return initialState;
  }
}

function writeDB(data: any) {
  const ts = Date.now();
  const stateWithTs = { ...data, lastUpdate: ts };
  writeFileSync(DB_FILE, JSON.stringify(stateWithTs, null, 2));
  return ts;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check lightweight
app.get('/api/ping', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Full state read
app.get('/api/state', (_req, res) => {
  const state = readDB();
  console.log(`[SYNC] GET /api/state — lastUpdate: ${state.lastUpdate}`);
  res.json(state);
});

// State push with conflict resolution (last-write-wins with staleness guard)
app.post('/api/sync', (req, res) => {
  const incoming = req.body;
  const current = readDB();

  // Si el cliente envía un clientLastUpdate y es más viejo que el servidor,
  // rechazamos el push para que el cliente primero haga poll y se ponga al día.
  const clientLastUpdate: number = incoming.clientLastUpdate ?? incoming.lastUpdate ?? 0;

  if (clientLastUpdate < current.lastUpdate && current.lastUpdate > 0) {
    console.warn(
      `[SYNC] ⚠ Push rechazado — cliente desactualizado.\n` +
      `  Cliente TS: ${clientLastUpdate} | Servidor TS: ${current.lastUpdate}`
    );
    return res.status(409).json({
      success: false,
      conflict: true,
      serverState: current,
      message: 'El servidor tiene datos más recientes. Por favor sincroniza primero.'
    });
  }

  // Eliminar el campo helper antes de guardar
  const { clientLastUpdate: _drop, ...stateToSave } = incoming;
  const ts = writeDB(stateToSave);

  console.log(`[SYNC] POST /api/sync — OK. Nuevo TS: ${ts}`);
  res.json({ success: true, lastUpdate: ts });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`\n🟢 FPOS SYNC SERVER corriendo en http://0.0.0.0:${port}`);
  console.log(`   GET  /api/ping  — health check`);
  console.log(`   GET  /api/state — leer estado completo`);
  console.log(`   POST /api/sync  — subir estado (con guard de conflicto)\n`);
});
