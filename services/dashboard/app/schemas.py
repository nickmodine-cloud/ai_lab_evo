
from pydantic import BaseModel


class Dashboard(BaseModel):
    """Lightweight schema for the dashboard service."""
    dashboard_id: str
    title: str
    widgets: int
