import type { Job } from "../types/job";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/translate";

/**
 * 
 *  Upload a file for translation
 * 
 */
export async function uploadFile(file: File): Promise<Job> {
    console.log('[API] Starting upload for file:', file.name);

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);

    console.log('[API] Sending POST request to:', `${API_URL}/upload`);

    try {
        // Send the file to the API
        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        console.log('[API] Response status:', response.status);
        console.log('[API] Response ok:', response.ok);
        console.log('[API] Response headers:', Object.fromEntries(response.headers.entries()));

        // Check if the response is ok
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API] Error response body:', errorText);
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }

        // Try to parse the response
        const responseText = await response.text();
        console.log('[API] Response body (raw):', responseText);

        const data = JSON.parse(responseText);
        console.log('[API] Parsed response:', data);

        return data;
    } catch (error) {
        console.error('[API] Upload error:', error);
        throw error;
    }
}


/**
 * 
 *  Get the status of a job
 * 
 */
export async function getJobStatus(job_id: string): Promise<Job> {
    const response = await fetch(`${API_URL}/status/${job_id}`);
    if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.statusText}`);
    }
    return response.json();
}

/**
 * 
 *  Start the translation of a job
 * 
 */
export async function startTranslation(job_id: string, target_language: string): Promise<Job> {
    const response = await fetch(`${API_URL}/translate/${job_id}?target_language=${target_language}`, {
        method: "POST",
    });
    if (!response.ok) {
        throw new Error(`Failed to start translation: ${response.statusText}`);
    }
    return response.json();
}

/**
 * 
 *  Download the translated document
 * 
 */
export async function downloadTranslatedDocument(job_id: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/download/${job_id}`);
    if (!response.ok) {
        throw new Error(`Failed to download translated document: ${response.statusText}`);
    }
    return response.blob();
}