const API_BASE_URL = '/api'

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  return handleResponse(response)
}

// Dashboard API
export async function fetchHealthSummary() {
  return request('/health/summary')
}

// Weight Tracker API
export async function fetchWeightEntries() {
  return request('/weight')
}

export async function addWeightEntry(entry) {
  return request('/weight', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
}

export async function deleteWeightEntry(id) {
  return request(`/weight/${id}`, {
    method: 'DELETE',
  })
}

// Nutrition Logger API
export async function fetchNutritionEntries(date) {
  const params = date ? `?date=${date}` : ''
  return request(`/nutrition${params}`)
}

export async function addNutritionEntry(entry) {
  return request('/nutrition', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
}

export async function deleteNutritionEntry(id) {
  return request(`/nutrition/${id}`, {
    method: 'DELETE',
  })
}

// Apple Health API
export async function fetchAppleHealthStatus() {
  return request('/apple-health/status')
}

export async function connectAppleHealth() {
  return request('/apple-health/connect', {
    method: 'POST',
  })
}

export async function disconnectAppleHealth() {
  return request('/apple-health/disconnect', {
    method: 'POST',
  })
}

export async function syncAppleHealthData() {
  return request('/apple-health/sync', {
    method: 'POST',
  })
}
