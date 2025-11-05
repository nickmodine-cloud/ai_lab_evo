from collections.abc import Generator
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from .config import get_settings
from .models import Base

engine: Optional[Engine] = None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, future=True)


def _create_engine() -> Engine:
    settings = get_settings()
    engine_kwargs = {"echo": settings.database_echo, "future": True}

    if settings.database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        if ":memory:" in settings.database_url or "mode=memory" in settings.database_url:
            engine_kwargs["poolclass"] = StaticPool
            if "mode=memory" in settings.database_url:
                connect_args["uri"] = True
        engine_kwargs["connect_args"] = connect_args

    return create_engine(settings.database_url, **engine_kwargs)


def get_engine() -> Engine:
    global engine
    if engine is None:
        engine = _create_engine()
        SessionLocal.configure(bind=engine)
    return engine


def reset_engine() -> None:
    """Dispose of the current engine so a new configuration can be applied."""
    global engine
    if engine is not None:
        engine.dispose()
    engine = None
    SessionLocal.configure(bind=None)


def init_db() -> None:
    """Create database tables if they do not exist."""
    current_engine = get_engine()
    Base.metadata.create_all(bind=current_engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a session per request."""
    get_engine()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
