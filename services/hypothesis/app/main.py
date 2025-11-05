from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api import router
from .config import get_settings
from .database import SessionLocal, init_db
from .seed import seed_demo_data


def create_app() -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        settings = get_settings()
        init_db()
        if settings.seed_demo_data:
            with SessionLocal() as session:
                seed_demo_data(session)
        yield

    app = FastAPI(title="Hypothesis Service", version="0.1.0", lifespan=lifespan)
    app.include_router(router)

    return app


app = create_app()
