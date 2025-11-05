
from pydantic import BaseModel


class ResourcePool(BaseModel):
    """Lightweight schema for the resource service."""
    pool_id: str
    utilization: float
    status: str
