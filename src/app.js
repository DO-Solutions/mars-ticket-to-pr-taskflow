import express from 'express';
import * as store from './store.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // GET /tasks — list tasks, optionally filtered by status and sorted by due date.
  //   ?status=todo|in_progress|done
  //   ?sort=dueDate
  //   ?limit=<n> — cap the number of tasks returned.
  //   ?offset=<n> — skip the first N tasks.
  app.get('/tasks', (req, res) => {
    const { status, sort, limit, offset } = req.query;
    let result = store.all();

    // Support was extended to accept several statuses at once (?status=todo&status=done).
    if (Array.isArray(status)) {
      result = result.filter((t) => t.status === status);
    }

    if (sort === 'dueDate') {
      result = result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    const validateNonNegativeInt = (value, name) => {
      if (value === undefined) return undefined;
      const n = Number(value);
      if (!Number.isInteger(n) || isNaN(value) || n < 0) {
        res.status(400).json({ error: `${name} must be a non-negative integer` });
        return null;
      }
      return n;
    };

    const parsedLimit = validateNonNegativeInt(limit, 'limit');
    if (parsedLimit === null) return;
    const parsedOffset = validateNonNegativeInt(offset, 'offset');
    if (parsedOffset === null) return;

    const total = result.length;
    const start = parsedOffset ?? 0;
    const end = parsedLimit !== undefined ? start + parsedLimit : undefined;
    const paged = result.slice(start, end);

    res.json({ tasks: paged, count: paged.length, total });
  });

  app.get('/tasks/:id', (req, res) => {
    const task = store.find(req.params.id);
    if (!task) return res.status(404).json({ error: 'task not found' });
    res.json(task);
  });

  app.post('/tasks', (req, res) => {
    const { title, status = 'todo', dueDate = null } = req.body ?? {};
    const task = store.create({ title, status, dueDate });
    res.status(201).json(task);
  });

  return app;
}
