
from file_storage.app.main import create_app


def test_app_startup():
    app = create_app()
    assert app.title == "File Storage Service"
