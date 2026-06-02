import {
    CourseListItem,
    SessionListItem,
    ExamListItem,
    CreateExamDto,
    UpdateExamDto,
} from '@server/entities/frontend';
import { handleApiError } from '../shared/utils.api';

const API_URL = 'http://localhost:3333/api';

function getAuthHeader() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function fetchActiveSessions(teacherId: number): Promise<SessionListItem[]> {
    const response = await fetch(`${API_URL}/session/teacher/${teacherId}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
}

export async function fetchCoursesByTeacher(teacherId: number): Promise<CourseListItem[]> {
    const response = await fetch(`${API_URL}/course?teacherId=${teacherId}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
}

export async function fetchSessionExams(
    sessionId: number,
    degreeId: number,
): Promise<ExamListItem[]> {
    const response = await fetch(
        `${API_URL}/exam?sessionId=${sessionId}&degreeId=${degreeId}`,
        { headers: getAuthHeader() },
    );
    if (!response.ok) await handleApiError(response);
    return response.json();
}

export async function createExam(dto: CreateExamDto): Promise<ExamListItem> {
    const response = await fetch(`${API_URL}/exam`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(dto),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
}

export async function updateExam(
    id: number,
    dto: UpdateExamDto,
): Promise<ExamListItem> {
    const response = await fetch(`${API_URL}/exam/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(dto),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
}

export async function deleteExam(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/exam/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) await handleApiError(response);
}
