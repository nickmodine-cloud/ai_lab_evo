
from typing import List

from fastapi import APIRouter

from .schemas import FileObject

router = APIRouter(prefix="/files", tags=["files"])


SAMPLE_DATA = [
    {
        "file_id": "FIL-1001",
        "name": "Experiment-report.pdf",
        "size_bytes": 204800
    }
]


@router.get("/", response_model=List[FileObject])
def list_files() -> List[FileObject]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
