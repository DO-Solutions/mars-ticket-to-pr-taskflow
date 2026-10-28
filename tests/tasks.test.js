import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import * as store from '../src/store.js';

const app = createApp();

beforeEach(() => store.reset());

describe('GET /health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('GET /tasks', () => {
  it('returns every task with a count', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(5);
    expect(res.body.tasks).toHaveLength(5);
  });

  it('returns tasks with the expected shape', async () => {
    const res = await request(app).get('/tasks');
    expect(res.body.tasks[0]).toEqual({
      id: expect.any(Number),
      title: expect.any(String),
      status: expect.any(String),
      dueDate: expect.anything(),
    });
  });

  // TF-101 — un-skip this test and make it pass.
  it.skip('filters by a single status', async () => {
    const res = await request(app).get('/tasks?status=done');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.tasks.every((t) => t.status === 'done')).toBe(true);
  });

  // TF-102 — un-skip this test and make it pass.
  it.skip('sorts by due date with undated tasks last', async () => {
    const res = await request(app).get('/tasks?sort=dueDate');
    const dates = res.body.tasks.map((t) => t.dueDate);
    expect(dates).toEqual(['2026-01-20', '2026-02-01', '2026-02-28', '2026-03-15', null]);
  });

  // TF-103 — limit and offset pagination.
  describe('pagination', () => {
    it('limits the number of tasks returned', async () => {
      const res = await request(app).get('/tasks?limit=2');
      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(2);
      expect(res.body.count).toBe(2);
      expect(res.body.total).toBe(5);
    });

    it('offsets past the first N tasks', async () => {
      const res = await request(app).get('/tasks?offset=2&limit=3');
      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(3);
      expect(res.body.count).toBe(3);
      expect(res.body.total).toBe(5);
      // The first task in the full list has id 1; offset 2 should skip ids 1 and 2.
      expect(res.body.tasks[0].id).toBe(3);
    });

    it('returns an empty array when offset exceeds available tasks', async () => {
      const res = await request(app).get('/tasks?offset=50');
      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(0);
      expect(res.body.count).toBe(0);
      expect(res.body.total).toBe(5);
    });

    it('rejects a negative limit with 400', async () => {
      const res = await request(app).get('/tasks?limit=-1');
      expect(res.status).toBe(400);
    });

    it('rejects a negative offset with 400', async () => {
      const res = await request(app).get('/tasks?offset=-5');
      expect(res.status).toBe(400);
    });

    it('rejects a non-numeric limit with 400', async () => {
      const res = await request(app).get('/tasks?limit=abc');
      expect(res.status).toBe(400);
    });

    it('rejects a non-numeric offset with 400', async () => {
      const res = await request(app).get('/tasks?offset=xyz');
      expect(res.status).toBe(400);
    });
  });
});

describe('GET /tasks/:id', () => {
  it('returns one task', async () => {
    const res = await request(app).get('/tasks/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('404s for an unknown id', async () => {
    const res = await request(app).get('/tasks/999');
    expect(res.status).toBe(404);
  });
});

describe('POST /tasks', () => {
  it('creates a task', async () => {
    const res = await request(app).post('/tasks').send({ title: 'New task' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New task');
    expect(res.body.status).toBe('todo');
  });

  // TF-104 — un-skip this test and make it pass.
  it.skip('rejects a task with no title', async () => {
    const res = await request(app).post('/tasks').send({ status: 'todo' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  // TF-104 — un-skip this test and make it pass.
  it.skip('rejects a blank title', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
  });
});
