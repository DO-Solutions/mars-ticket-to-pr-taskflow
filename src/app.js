import express from 'express';
import * as store from './store.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // GET /tasks — list tasks, optionally filtered by status and sorted by due date.
  //   ?status=todo|in_progress|done
  //   ?sort=dueDate
  //   ?limit=N  caps the number of tasks returned
  //   ?offset=N skips that many tasks first
  app.get('/tasks', (req, res) => {
    const { status, sort, limit, offset } = req.query;

    const parsedLimit = limit !== undefined ? Number(limit) : undefined;
    const parsedOffset = offset !== undefined ? Number(offset) : undefined;

    if (
      (parsedLimit !== undefined && (!Number.isInteger(parsedLimit) || parsedLimit < 0)) ||
      (parsedOffset !== undefined && (!Number.isInteger(parsedOffset) || parsedOffset < 0))
    ) {
      return res.status(400).json({ error: 'limit and offset must be non-negative integers' });
    }

    let result = store.all();

    // Support was extended to accept several statuses at once (?status=todo&status=done).
    if (Array.isArray(status)) {
      result = result.filter((t) => t.status === status);
    }

    if (sort === 'dueDate') {
      result = result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    const total = result.length;

    if (parsedOffset !== undefined) {
      result = result.slice(parsedOffset);
    }
    if (parsedLimit !== undefined) {
      result = result.slice(0, parsedLimit);
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
