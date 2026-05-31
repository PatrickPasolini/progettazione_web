import { TeacherListItem, CreateTeacherDto, UpdateTeacherDto } from '@server/entities';
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeader() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function fetchTeachers() : Promise<TeacherListItem[]> {
    const response = await fetch(`${API_URL}/teacher`, {
        headers: getAuthHeader(),
    });

    if(!response.ok) {
        await handleApiError(response);
    }

    const data: TeacherListItem[] = await response.json();
    return data;
}

export async function fetchTeacherById(id: number) : Promise<TeacherListItem> {
    const response = await fetch(`${API_URL}/teacher/${id}`, {
        headers: getAuthHeader(),
    });

    if(!response.ok) {
        await handleApiError(response);
    }

    const data: TeacherListItem = await response.json();
    return data;
}

export async function createTeacher(payload: CreateTeacherDto): Promise<TeacherListItem> {
    const response = await fetch(`${API_URL}/teacher`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
    });

    if(!response.ok) {
        await handleApiError(response);
    }
    
    const data: TeacherListItem = await response.json();
    return data;
}

export async function updateTeacher(id: number, payload: UpdateTeacherDto): Promise<TeacherListItem> {
    const response = await fetch(`${API_URL}/teacher/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
    });

    if(!response.ok) {
        await handleApiError(response);
    }
    
    const data: TeacherListItem = await response.json();
    return data;
}

export async function deleteTeacher(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/teacher/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });

    if(!response.ok) {
        await handleApiError(response);
    }
}

