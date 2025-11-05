
import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from hypothesis.app.config import get_settings
from hypothesis.app.database import reset_engine
from hypothesis.app.main import create_app


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    db_path = tmp_path / "hypothesis.db"
    monkeypatch.setenv("HYPOTHESIS_DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("HYPOTHESIS_SEED_DEMO_DATA", "1")
    get_settings.cache_clear()
    reset_engine()
    app = create_app()
    with TestClient(app) as test_client:
        yield test_client


def test_list_hypotheses_returns_seed_records(client: TestClient) -> None:
    response = client.get("/hypotheses/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert all(re.match(r"HYP-\d{3,}", item["hypId"]) for item in data)


def test_create_hypothesis_persists_record(client: TestClient) -> None:
    payload = {
        "title": "GenAI contract summariser",
        "statement": "We believe automated summarisation will reduce legal review effort by 30%.",
        "labId": "LAB-BETA",
        "aiType": "LLM",
        "priority": "MEDIUM",
        "owners": [
            {"name": "Jordan Blake", "email": "jordan.blake@example.com", "role": "OWNER", "department": "Legal"}
        ],
        "impactScore": 7.2,
        "feasibilityScore": 6.4,
        "confidenceScore": 0.68,
        "tags": ["Legal", "GenAI"],
        "successMetrics": [{"label": "Review time reduction", "target": 30, "direction": "DECREASE", "unit": "%"}],
    }

    response = client.post("/hypotheses/", json=payload)
    assert response.status_code == 201
    detail = response.json()
    hyp_id = detail["hypId"]
    assert re.match(r"HYP-\d{3,}", hyp_id)
    assert detail["stage"] == "IDEATION"

    fetched = client.get(f"/hypotheses/{hyp_id}")
    assert fetched.status_code == 200
    assert fetched.json()["title"] == payload["title"]


def test_update_hypothesis_stage_tracks_history(client: TestClient) -> None:
    hyp_id = client.get("/hypotheses/").json()[0]["hypId"]
    response = client.patch(
        f"/hypotheses/{hyp_id}",
        json={"stage": "SCOPING", "stageHealth": "warning", "updatedBy": "QA Bot"},
    )
    assert response.status_code == 200
    detail = response.json()
    assert detail["stage"] == "SCOPING"
    assert detail["stageHistory"][-1]["stage"] == "SCOPING"
    assert detail["stageHistory"][-1]["changedBy"] == "QA Bot"


def test_archive_hypothesis_removes_from_catalog(client: TestClient) -> None:
    hyp_id = client.get("/hypotheses/").json()[0]["hypId"]
    delete_response = client.delete(f"/hypotheses/{hyp_id}")
    assert delete_response.status_code == 204

    detail_response = client.get(f"/hypotheses/{hyp_id}")
    assert detail_response.status_code == 404

    catalogue = client.get("/hypotheses/").json()
    assert hyp_id not in {item["hypId"] for item in catalogue}


def test_dashboard_exposes_portfolio_summary(client: TestClient) -> None:
    response = client.get("/hypotheses/dashboard")
    assert response.status_code == 200
    payload = response.json()
    assert "stages" in payload and len(payload["stages"]) >= 1
    assert "highlights" in payload
    assert "focusHypothesis" in payload
    assert "tasks" in payload
    assert "activity" in payload


def test_comment_lifecycle(client: TestClient) -> None:
    hyp_id = client.get("/hypotheses/").json()[0]["hypId"]
    create_payload = {
        "author": {"name": "QA Agent", "email": "qa@example.com", "role": "REVIEWER"},
        "body": "Please double-check ROI assumptions.",
    }
    create_response = client.post(f"/hypotheses/{hyp_id}/comments", json=create_payload)
    assert create_response.status_code == 201
    comment = create_response.json()
    assert comment["body"] == create_payload["body"]
    comment_id = comment["id"]

    update_response = client.patch(
        f"/hypotheses/{hyp_id}/comments/{comment_id}",
        json={"isResolved": True},
    )
    assert update_response.status_code == 200
    assert update_response.json()["isResolved"] is True

    delete_response = client.delete(f"/hypotheses/{hyp_id}/comments/{comment_id}")
    assert delete_response.status_code == 204


def test_attachment_creation(client: TestClient) -> None:
    hyp_id = client.get("/hypotheses/").json()[0]["hypId"]
    payload = {
        "name": "Risk assessment.pdf",
        "url": "https://files.example.com/risk.pdf",
        "uploadedBy": "Cassie Liu",
        "uploadedByEmail": "cassie.liu@example.com",
    }
    response = client.post(f"/hypotheses/{hyp_id}/attachments", json=payload)
    assert response.status_code == 201
    attachment = response.json()
    assert attachment["name"] == payload["name"]


def test_checklist_item_crud(client: TestClient) -> None:
    hyp_id = client.get("/hypotheses/").json()[0]["hypId"]
    create_resp = client.post(
        f"/hypotheses/{hyp_id}/checklist",
        json={
            "label": "Security sign-off",
            "owner": "Security Guild",
        },
    )
    assert create_resp.status_code == 201
    detail = create_resp.json()
    created_item = next(
        (item for item in detail["gatingChecklist"] if item["label"] == "Security sign-off"), None
    )
    assert created_item is not None
    item_id = created_item["id"]

    update_resp = client.patch(
        f"/hypotheses/{hyp_id}/checklist/{item_id}",
        json={"status": "complete"},
    )
    assert update_resp.status_code == 200
    updated_detail = update_resp.json()
    updated_item = next(item for item in updated_detail["gatingChecklist"] if item["id"] == item_id)
    assert updated_item["status"] == "complete"

    remove_resp = client.delete(f"/hypotheses/{hyp_id}/checklist/{item_id}")
    assert remove_resp.status_code == 200
    removed_detail = remove_resp.json()
    assert all(item["id"] != item_id for item in removed_detail["gatingChecklist"])


def test_stage_transition_blocked_when_requirements_missing(client: TestClient) -> None:
    detail = client.get("/hypotheses/HYP-001").json()
    assert detail["stage"] == "PRIORITIZATION"
    # Attempt to move forward to EXPERIMENTATION should fail due to pending checklist/approvals
    resp = client.patch(
        "/hypotheses/HYP-001",
        json={"stage": "EXPERIMENTATION", "updatedBy": "QA Bot"},
    )
    assert resp.status_code == 400
