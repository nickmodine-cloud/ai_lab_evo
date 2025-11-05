
from fastapi import FastAPI

from .api import router


def create_app() -> FastAPI:
    app = FastAPI(title="File Storage Service", version="0.1.0")
    app.include_router(router)
    return app


app = create_app()
