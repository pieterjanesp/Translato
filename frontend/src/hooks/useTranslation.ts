import { useState, useEffect } from "react";
import type { Job } from "../types/job";
import * as api from "../api/translate";

export function useTranslation() {
    //State to store the job
    const [job, setJob] = useState<Job | null>(null);
    //State to store the error
    const [error, setError] = useState<string | null>(null);
    // State to store uploading status
    const [uploading, setUploading] = useState(false);
    // State to store translating status
    const [translating, setTranslating] = useState(false);

    // Function to upload a file
    const uploadFile = async (file: File) => {
        setError(null);
        setUploading(true);
        try {
            const newJob = await api.uploadFile(file);
            setJob(newJob);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
        } finally {
            setUploading(false);
        }
    }

    // Function to start the translation of a job
    const startTranslation = async (job_id: string, target_language: string) => {
        setError(null);
        setTranslating(true);
        try {
            const newJob = await api.startTranslation(job_id, target_language);
            setJob(newJob);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
        } finally {
            setTranslating(false);
        }
    }

    // Function to download the translated document
    const downloadFile = async (job_id: string) => {
        if(!job) {
            setError("No job found");
            return;
        }
        try {
            const blob = await api.downloadTranslatedDocument(job_id);

            // Create temporary URL for the blob
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${job.filename.split('.')[0]}_translated.${job.filename.split('.')[1]}`;
            document.body.appendChild(a);
            a.click();

            //Clean up the temporary URL
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
        }
    }

    useEffect(() => {
        if (!job || job.status === 'completed' || job.status === 'failed') {
            return;
        }
        const interval = setInterval(async () => {
            try {
                const updatedJob = await api.getJobStatus(job.job_id);
                setJob(updatedJob);
            } catch (error) {
                setError(error instanceof Error ? error.message : "An unknown error occurred");
            }
        }, 1000); // Poll every one second
        return () => clearInterval(interval);
    }, [job]);
    
    // Function to clear error manually
    const clearError = () => {
        setError(null);
    }

    return {
        job,
        error,
        uploading,
        translating,
        downloadFile,
        uploadFile,
        startTranslation,
        clearError,
    }
}
