
from typing import List

from fastapi import APIRouter

from .schemas import WorkflowTemplate

router = APIRouter(prefix="/workflows", tags=["workflows"])


SAMPLE_DATA = [
    {
        "template_id": "WF-HYP-GATE",
        "name": "Hypothesis Gating",
        "version": "1.3"
    }
]


@router.get("/", response_model=List[WorkflowTemplate])
def list_workflows() -> List[WorkflowTemplate]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
