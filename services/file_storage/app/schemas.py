
from pydantic import BaseModel


class FileObject(BaseModel):
    """Lightweight schema for the file storage service."""
    file_id: str
    name: str
    size_bytes: int
