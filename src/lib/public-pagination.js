// Cursor-based pagination also works when the API row cap is below pageSize.
// The exact counts catch incomplete pages and changes to the visible collection.
export const PUBLIC_PAGE_SIZE = 250;

export async function fetchAllById(loadPage, loadTotal, { label = 'records', pageSize = PUBLIC_PAGE_SIZE } = {}) {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 1000) {
    throw new Error('pageSize must be between 1 and 1000');
  }

  const records = [];
  let cursor = null;
  let initialCount = null;

  while (true) {
    const { data, error, count } = await loadPage(cursor, pageSize);
    if (error) throw new Error('Failed to fetch ' + label + ': ' + (error.message || String(error)));
    if (!Array.isArray(data)) throw new Error('Invalid ' + label + ' response: missing rows');
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error('Invalid ' + label + ' response: exact count unavailable');
    }
    if (initialCount === null) initialCount = count;
    if (count !== initialCount - records.length) {
      throw new Error('Public ' + label + ' changed during pagination; retry the build');
    }
    if (data.length > pageSize || data.length > count || (!data.length && count > 0)) {
      throw new Error('Invalid ' + label + ' response: incomplete or oversized page');
    }

    let last = cursor;
    for (const record of data) {
      if (typeof record?.id !== 'string' || !record.id || (last !== null && record.id <= last)) {
        throw new Error('Invalid ' + label + ' response: non-increasing or missing ID');
      }
      last = record.id;
    }
    records.push(...data);
    if (data.length === count) break;
    cursor = last;
  }

  const { count, error } = await loadTotal();
  if (error) throw new Error('Failed to verify ' + label + ' count: ' + (error.message || String(error)));
  if (!Number.isSafeInteger(count) || count !== initialCount || count !== records.length) {
    throw new Error('Public ' + label + ' count changed during pagination; retry the build');
  }
  return records;
}
