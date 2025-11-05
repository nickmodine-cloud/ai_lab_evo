
from pydantic import BaseModel


class WorkflowTemplate(BaseModel):
    """Lightweight schema for the workflow service."""
    template_id: str
    name: str
    version: str
