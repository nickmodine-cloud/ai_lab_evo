
from pydantic import BaseModel


class Approval(BaseModel):
    """Lightweight schema for the governance service."""
    approval_id: str
    hypothesis_id: str
    status: str
