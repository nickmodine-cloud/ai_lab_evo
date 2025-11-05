
from pydantic import BaseModel


class Lab(BaseModel):
    """Lightweight schema for the laboratory service."""
    lab_id: str
    name: str
    owner: str
