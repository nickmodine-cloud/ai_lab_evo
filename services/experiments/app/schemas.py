
from pydantic import BaseModel


class Experiment(BaseModel):
    """Lightweight schema for the experiment service."""
    exp_id: str
    hypothesis_id: str
    status: str
    owner: str
