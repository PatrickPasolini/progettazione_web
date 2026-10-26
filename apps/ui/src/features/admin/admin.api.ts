import { TeacherListItem } from '@server/entities/frontend';
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

// I segretari hanno la stessa forma base di un utente (id, name, surname, email, role).
export type SecretaryListItem = TeacherListItem;

function getAuthHeader() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export interface CreateSecretaryDto {
    name: string;
    surname: string;
    email: string;
    password: string;
}

export interface UpdateSecretaryDto {
    name: string;
    surname: string;
    email: string;
    password?: string;
}

export async function fetchSecretaries(): Promise<SecretaryListItem[]> {
    const response = await fetch(`${API_URL}/users?role=SECRETARY`, {
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createSecretary(payload: CreateSecretaryDto): Promise<SecretaryListItem> {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ ...payload, role: 'SECRETARY' }),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function updateSecretary(id: number, payload: UpdateSecretaryDto): Promise<SecretaryListItem> {
    // Non inviare la password se lasciata vuota (evita la validazione sul campo).
    const body: Record<string, unknown> = {
        name: payload.name,
        surname: payload.surname,
        email: payload.email,
    };
    if (payload.password) body.password = payload.password;

    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function deleteSecretary(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        await handleApiError(response);
    }
}
