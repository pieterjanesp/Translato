import uuid
from pathlib import Path
from datetime import datetime
from app.models.schemas import Job, JobStatus
from app.handlers.docx import DOCXHandler
from app.handlers.pptx import PPTXHandler
from anthropic import Anthropic
import os
from dotenv import load_dotenv

load_dotenv()

anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class TranslationService:
    def __init__(self): 
        self.temp_dir = Path("/tmp/document_translator")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.jobs = {}
        # Initialize Anthropic client
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY is not set")
        self.anthropic = Anthropic(api_key=api_key)

    def create_job(self, filename: str, file_content: bytes) -> Job:
        job_id = str(uuid.uuid4())
        # Create a file path for this file
        file_path = self.temp_dir / f"{job_id}_{filename}"
        # Save uploaded file to disk
        with open(file_path, "wb") as f:
            f.write(file_content)
        # Create a job object
        job = Job(
            job_id=job_id, 
            filename=filename, 
            file_path=str(file_path), 
            status=JobStatus.PENDING, 
            created_at=datetime.now(),
            output_path=None,
            )
        # Add job to in-memory dictionary
        self.jobs[job_id] = job
        return job

    def get_job(self, job_id: str) -> Job | None:
        return self.jobs.get(job_id)
    def update_status(self, job_id: str, status: JobStatus) -> None:
        job = self.jobs.get(job_id)
        if job:
            job.status = status

    def _get_handler(self, filename: str):
        """Get the appropriate handler based on file extension"""
        path = Path(filename)
        if path.suffix.lower() == ".docx":
            return DOCXHandler()
        elif path.suffix.lower() == ".pptx":
            return PPTXHandler()
        else:
            raise ValueError(f"Unsupported file extension: {path.suffix}")

    def _translate_text(self, text: str, target_language: str) -> str:
        """Translate text using Anthropic"""
        try:
            message = self.anthropic.messages.create(
                model="claude-3-5-haiku-20241022",
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": f"Translate the following text to {target_language}. Return ONLY the translation, no explanations:\n\n{text}"
                    }
                ]
            )
            return message.content[0].text
        except Exception as e:
            raise ValueError(f"Error translating text: {e}")
            return f"[TRANSLATION_ERROR] {text}"

    def process_translation(self, job_id: str, target_language: str) -> None:
        """Process the translation of a job"""
        job = self.jobs.get(job_id)
        if not job:
            raise ValueError(f"Job not found: {job_id}")
        file_path = Path(job.file_path)
        handler = self._get_handler(job.filename)
        texts = handler.extract_text(job.file_path)
        translated_texts = dict(zip(texts, [self._translate_text(text, target_language) for text in texts]))
        # Define Output File Name and Path
        output_filename = f"{job_id}_{file_path.stem}_translated{file_path.suffix}"
        output_path = self.temp_dir / output_filename
        # Actually replace the text in the file
        handler.replace_text(job.file_path, translated_texts, str(output_path))
        # Save the translated file to the job
        job.output_path = str(output_path)
        job.status = JobStatus.COMPLETED