
from pydantic import BaseModel


class Metric(BaseModel):
    """Lightweight schema for the analytics service."""
    metric_id: str
    stage: str
    value: float
