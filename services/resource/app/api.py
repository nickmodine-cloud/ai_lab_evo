
from typing import List

from fastapi import APIRouter

from .schemas import ResourcePool

router = APIRouter(prefix="/resources", tags=["resources"])


SAMPLE_DATA = [
    {
        "pool_id": "GPU-A100",
        "utilization": 0.72,
        "status": "HEALTHY"
    }
]


@router.get("/", response_model=List[ResourcePool])
def list_resources() -> List[ResourcePool]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
