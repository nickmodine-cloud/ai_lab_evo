
from pydantic import BaseModel


class DictionaryItem(BaseModel):
    """Lightweight schema for the admin service."""
    dictionary: str
    code: str
    label: str
