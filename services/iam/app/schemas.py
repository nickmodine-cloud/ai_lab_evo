
from pydantic import BaseModel


class Identity(BaseModel):
    """Lightweight schema for the identity service."""
    user_id: str
    name: str
    role: str
