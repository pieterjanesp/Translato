from fastapi import APIRouter
from fastapi import UploadFile, File
from fastapi.responses import FileResponse
from app.services.translation_service import TranslationService
from app.models.schemas import JobResponse, JobStatus
from fastapi import HTTPException
from pathlib import Path
from app.core.config import settings


router = APIRouter()
translation_service = TranslationService()

@router.post('/upload')
async def upload_document(file: UploadFile = File(...)):
    print(f"[BACKEND] Received upload request for file: {file.filename}")
    print(f"[BACKEND] File content type: {file.content_type}")

    file_content = await file.read()
    print(f"[BACKEND] File size: {len(file_content)} bytes")

    job = translation_service.create_job(file.filename, file_content)
    print(f"[BACKEND] Created job: {job.job_id}")
    print(f"[BACKEND] Job dict: {job.dict()}")

    response = JobResponse(**job.dict())
    print(f"[BACKEND] JobResponse: {response.dict()}")
    print(f"[BACKEND] JobResponse JSON: {response.json()}")

    return response

@router.get("/status/{job_id}")
def get_status(job_id: str):
    job = translation_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobResponse(**job.dict())

@router.post("/translate/{job_id}")
def start_translation(job_id: str, target_language: str = "en"):
    """Start the translation of a job"""
    try:
        translation_service.process_translation(job_id, target_language)
        job = translation_service.get_job(job_id)
        return JobResponse(**job.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{job_id}")
def download_translated_document(job_id: str):
    """Download the translated document"""
    job = translation_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail=f"Job not completed, current status: {job.status}")
    if not job.output_path:
        raise HTTPException(status_code=404, detail="No output path found")
    return FileResponse(path=job.output_path, 
                        filename=Path(job.output_path).name, 
                        media_type='application/octet-stream')
