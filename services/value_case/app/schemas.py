
from pydantic import BaseModel


class ValueCase(BaseModel):
    """Lightweight schema for the value case service."""
    case_id: str
    title: str
    sponsor: str
    currency: str
