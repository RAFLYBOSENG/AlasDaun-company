export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = {};
  const options = {
    method,
    credentials: 'same-origin',
    headers,
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Pastikan API dan database tersedia.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Server mengirim respons yang tidak valid (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const error = new Error(result.error || `Permintaan gagal (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return result;
}
