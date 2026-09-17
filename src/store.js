// In-memory task store. Seeded on import so the API is useful without a database.
let seq = 0;
let tasks = [];

function seed() {
  seq = 0;
  tasks = [];
  create({ title: 'Ship the onboarding email', status: 'done', dueDate: '2026-02-01' });
  create({ title: 'Fix flaky checkout test', status: 'in_progress', dueDate: '2026-03-15' });
  create({ title: 'Write the Q2 roadmap', status: 'todo', dueDate: null });
  create({ title: 'Rotate staging credentials', status: 'todo', dueDate: '2026-01-20' });
  create({ title: 'Archive the legacy dashboard', status: 'done', dueDate: '2026-02-28' });
}

export function create({ title, status = 'todo', dueDate = null }) {
  const task = { id: ++seq, title, status, dueDate };
  tasks.push(task);
  return task;
}

export function all() {
  return tasks.map((t) => ({ ...t }));
}

export function find(id) {
  const t = tasks.find((x) => x.id === Number(id));
  return t ? { ...t } : undefined;
}

export function reset() {
  seed();
}

seed();
