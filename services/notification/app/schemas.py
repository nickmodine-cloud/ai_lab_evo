
from pydantic import BaseModel


class Notification(BaseModel):
    """Lightweight schema for the notification service."""
    notification_id: str
    title: str
    channel: str
