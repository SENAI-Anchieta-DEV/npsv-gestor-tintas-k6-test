import { check } from 'k6';

export function checkJsonResponse(response, expectedStatus, label) {
  return check(response, {
    [`${label}: status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${label}: retornou JSON`]: (r) =>
      (r.headers['Content-Type'] || '').includes('application/json'),
  });
}

export function checkStatus(response, expectedStatus, label) {
  return check(response, {
    [`${label}: status ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
}

export function checkMaxDuration(response, maxMs, label) {
  return check(response, {
    [`${label}: duração menor que ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}