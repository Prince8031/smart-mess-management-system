import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getStorage } from '../src/context/AppContext';

test('getStorage falls back to seeded data when stored array is empty', () => {
  localStorage.clear();
  localStorage.setItem('smart_mess_students', JSON.stringify([]));

  const fallback = [{ id: 'demo-1', name: 'Demo Student', role: 'student', status: 'Active' } as any];
  const result = getStorage('students', fallback);

  assert.deepEqual(result, fallback);
});
