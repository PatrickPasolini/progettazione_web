
import { CourseListItem } from '../../../../../libs/server/entities/src/interfaces/course-list-item';
import { SessionListItem } from '../../../../../libs/server/entities/src/interfaces/session-list-item';
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeader() {
    const token = localStorage.getItem('access_token');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function featchSessionsByTeacherId(id: number) : Promise<SessionListItem[]> {
    const response = await fetch(`${API_URL}/session/teacher/${id}`, {
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    const data: SessionListItem[] = await response.json();

    return data;
}

export async function featchSessionbyId(id: number) : Promise<SessionListItem> {
    return null;
}

export async function featchCoursesByTeacherId(id: number) : Promise<CourseListItem[]> {
    return null;
}

export async function featchCourseById(id: number) : Promise<CourseListItem> {
    return null;
}



