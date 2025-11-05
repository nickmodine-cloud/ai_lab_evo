from typing import List

from fastapi import APIRouter, Depends, status

from .dependencies import get_hypothesis_service
from . import schemas
from .schemas import (
    Hypothesis,
    HypothesisAttachment,
    HypothesisComment,
    HypothesisCreatePayload,
    HypothesisDashboard,
    HypothesisDetail,
    HypothesisUpdatePayload,
)
from .services import HypothesisService

router = APIRouter(prefix="/hypotheses", tags=["hypotheses"])


@router.get("/", response_model=List[Hypothesis])
def list_hypotheses(service: HypothesisService = Depends(get_hypothesis_service)) -> List[Hypothesis]:
    """Return the active hypothesis catalogue."""
    return service.list_hypotheses()


@router.get("/dashboard", response_model=HypothesisDashboard)
def hypothesis_dashboard(
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisDashboard:
    """Return aggregated portfolio analytics for the workspace."""
    return service.build_dashboard()


@router.post("/", response_model=HypothesisDetail, status_code=status.HTTP_201_CREATED)
def create_hypothesis(
    payload: HypothesisCreatePayload,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisDetail:
    """Create a new hypothesis record."""
    return service.create(payload)


@router.patch("/{hyp_id}", response_model=HypothesisDetail)
def update_hypothesis(
    hyp_id: str,
    payload: HypothesisUpdatePayload,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisDetail:
    """Apply partial updates to an existing hypothesis."""
    return service.update(hyp_id, payload)


@router.delete("/{hyp_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_hypothesis(
    hyp_id: str,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> None:
    """Soft-delete (archive) the hypothesis."""
    service.archive(hyp_id)
    return None


@router.get("/{hyp_id}", response_model=HypothesisDetail)
def get_hypothesis(
    hyp_id: str,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisDetail:
    """Fetch the detailed view for a single hypothesis."""
    return service.get(hyp_id)


@router.post(
    "/{hyp_id}/comments",
    response_model=HypothesisComment,
    status_code=status.HTTP_201_CREATED,
)
def add_comment(
    hyp_id: str,
    payload: schemas.CommentCreatePayload,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisComment:
    return service.add_comment(hyp_id, payload)


@router.patch(
    "/{hyp_id}/comments/{comment_id}",
    response_model=HypothesisComment,
)
def update_comment(
    hyp_id: str,
    comment_id: str,
    payload: schemas.CommentUpdatePayload,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisComment:
    return service.update_comment(hyp_id, comment_id, payload)


@router.delete(
    "/{hyp_id}/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    hyp_id: str,
    comment_id: str,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> None:
    service.delete_comment(hyp_id, comment_id)
    return None


@router.post(
    "/{hyp_id}/attachments",
    response_model=HypothesisAttachment,
    status_code=status.HTTP_201_CREATED,
)
def add_attachment(
    hyp_id: str,
    payload: schemas.AttachmentCreatePayload,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisAttachment:
    return service.add_attachment(hyp_id, payload)


@router.post(
    "/{hyp_id}/checklist",
    response_model=HypothesisDetail,
    status_code=status.HTTP_201_CREATED,
)
def add_checklist_item(
    hyp_id: str,
    payload: schemas.ChecklistItemCreatePayload,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisDetail:
    return service.add_checklist_item(hyp_id, payload)


@router.patch(
    "/{hyp_id}/checklist/{item_id}",
    response_model=HypothesisDetail,
)
def update_checklist_item(
    hyp_id: str,
    item_id: str,
    payload: schemas.ChecklistItemUpdatePayload,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisDetail:
    return service.update_checklist_item(hyp_id, item_id, payload)


@router.delete(
    "/{hyp_id}/checklist/{item_id}",
    response_model=HypothesisDetail,
)
def remove_checklist_item(
    hyp_id: str,
    item_id: str,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisDetail:
    return service.remove_checklist_item(hyp_id, item_id)


@router.patch(
    "/{hyp_id}/tasks/{task_id}",
    response_model=HypothesisDetail,
)
def update_task(
    hyp_id: str,
    task_id: str,
    payload: schemas.TaskUpdatePayload,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisDetail:
    return service.update_task(hyp_id, task_id, payload)


@router.patch(
    "/{hyp_id}/approvals/{approval_id}",
    response_model=HypothesisDetail,
)
def update_approval(
    hyp_id: str,
    approval_id: str,
    payload: schemas.ApprovalUpdatePayload,
    service: HypothesisService = Depends(get_hypothesis_service),
) -> HypothesisDetail:
    return service.update_approval(hyp_id, approval_id, payload)
