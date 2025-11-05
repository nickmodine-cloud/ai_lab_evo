
from pydantic import BaseModel


class ROICalculation(BaseModel):
    """Lightweight schema for the roi calculator service."""
    calc_id: str
    hypothesis_id: str
    roi_percent: float
    payback_months: int
