
from value_case.app.main import create_app


def test_app_startup():
    app = create_app()
    assert app.title == "Value Case Service"
