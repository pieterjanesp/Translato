from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class JobStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    filename: str
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class Job(BaseModel):
    job_id: str
    status: JobStatus
    filename: str
    created_at: datetime
    file_path: str
    output_path: str | None
    class Config:
        validate_assignment = True
