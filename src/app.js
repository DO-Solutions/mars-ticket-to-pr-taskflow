import express from 'express';
import * as store from './store.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // GET /tasks — list tasks, optionally filtered by status and sorted by due date.
  //   ?status=todo|in_progress|done
  //   ?sort=dueDate
  //   ?limit=N   — cap the number of tasks returned.
  //   ?offset=N  — skip the first N tasks.
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

    const total = result.length;

    if (offset !== undefined) {
      const n = Number(offset);
      if (!Number.isInteger(n) || n < 0) {
        return res.status(400).json({ error: 'offset must be a non-negative integer' });
      }
      result = result.slice(n);
    }

    if (limit !== undefined) {
      const n = Number(limit);
      if (!Number.isInteger(n) || n < 0) {
        return res.status(400).json({ error: 'limit must be a non-negative integer' });
      }
      result = result.slice(0, n);
    }

    res.json({ tasks: result, count: result.length, total });
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
