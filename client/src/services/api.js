const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function sendMessage(message, conversationId = null) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Gagal mengirim pesan');
  }

  return response.json();
}

export async function createConversation(title = 'Percakapan Baru') {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Gagal membuat percakapan');
  }

  return response.json();
}

export async function getConversations() {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Gagal mengambil percakapan');
  }

  return response.json();
}

export async function getConversationMessages(conversationId) {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Gagal mengambil pesan percakapan');
  }

  const json = await response.json();
  
  // Handle both formats: direct messages array or nested in response
  return {
    success: true,
    data: json.messages || json.data || []
  };
}

export async function deleteConversation(conversationId) {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Gagal menghapus percakapan');
  }

  return response.json();
}
