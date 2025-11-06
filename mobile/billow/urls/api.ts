import { API_BASE_URL } from "./urls";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  EVENTS: {
    ME: `${API_BASE_URL}/events/me`,
    ACTIVE: `${API_BASE_URL}/events/me/active`,
    CREATE: `${API_BASE_URL}/events`,
    GET: (eventId: number) => `${API_BASE_URL}/events/${eventId}`,
    FINISH: (eventId: number) => `${API_BASE_URL}/events/${eventId}/finish`,
    ADD_PARTICIPANT: (eventId: number, userId: number) => `${API_BASE_URL}/events/${eventId}/participants/${userId}`,
    REMOVE_PARTICIPANT: (eventId: number, userId: number) => `${API_BASE_URL}/events/${eventId}/participants/${userId}`,
  },
  EXPENSES: {
    CREATE: `${API_BASE_URL}/expenses`,
    GET_BY_EVENT: (eventId: number) => `${API_BASE_URL}/expenses/event/${eventId}`,
    UPDATE: (expenseId: number) => `${API_BASE_URL}/expenses/${expenseId}`,
    DELETE: (expenseId: number) => `${API_BASE_URL}/expenses/${expenseId}`,
    BALANCE: (eventId: number) => `${API_BASE_URL}/expenses/event/${eventId}/balance`,
  },
  USERS: {
    SEARCH: `${API_BASE_URL}/users/search`,
  },
  FRIENDS: {
    LIST: `${API_BASE_URL}/friends/`,
    REQUEST: (friendId: number) => `${API_BASE_URL}/friends/request/${friendId}`,
    PENDING: `${API_BASE_URL}/friends/requests/pending`,
    SENT: `${API_BASE_URL}/friends/requests/sent`,
    ACCEPT: (friendshipId: number) => `${API_BASE_URL}/friends/${friendshipId}/accept`,
    REJECT: (friendshipId: number) => `${API_BASE_URL}/friends/${friendshipId}/reject`,
  },
};

