
from roi_calculator.app.main import create_app


def test_app_startup():
    app = create_app()
    assert app.title == "ROI Calculator Service"
