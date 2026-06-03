
import { CourseListItem } from '../../../../../libs/server/entities/src/interfaces/course-list-item';
import { SessionListItem } from '../../../../../libs/server/entities/src/interfaces/session-list-item';
import { ExamListItem } from '../../../../../libs/server/entities/src/interfaces/exam-list-item';
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

export async function featchCoursesByTeacherAndSession(teacherId: number, sessionId: number): Promise<CourseListItem[]> {
    const response = await fetch(`${API_URL}/course/teacher/${teacherId}/session/${sessionId}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        await handleApiError(response);
    }
    return response.json();
}

export async function featchCourseById(id: number) : Promise<CourseListItem> {
    return null;
}

export async function fetchExamsBySessionAndDegree(
    sessionId: number,
    degreeId: number,
): Promise<ExamListItem[]> {
    const res = await fetch(
        `${API_URL}/exam?sessionId=${sessionId}&degreeId=${degreeId}`,
        { headers: getAuthHeader() },
    );
    if (!res.ok) await handleApiError(res);
    return res.json();
}

export async function createExam(dto: {
    sessionId: number;
    courseId: number;
    degreeId: number;
    examDate: string;
    startTime: string;
    endTime: string;
}): Promise<ExamListItem> {
    const res = await fetch(`${API_URL}/exam`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(dto),
    });
    if (!res.ok) await handleApiError(res);
    return res.json();
}

export async function updateExam(
    id: number,
    dto: { examDate?: string; startTime?: string; endTime?: string },
): Promise<ExamListItem> {
    const res = await fetch(`${API_URL}/exam/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(dto),
    });
    if (!res.ok) await handleApiError(res);
    return res.json();
}

export async function deleteExam(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/exam/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!res.ok) await handleApiError(res);
}

