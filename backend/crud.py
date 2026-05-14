import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
import models
import schemas

logger = logging.getLogger(__name__)


def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    logger.info("태스크 생성 완료: id=%s", db_task.id)
    return db_task


def get_tasks(db: Session) -> list[models.Task]:
    return db.query(models.Task).order_by(models.Task.created_at.desc()).all()


def get_task(db: Session, task_id: int) -> Optional[models.Task]:
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def update_task(
    db: Session, task_id: int, task: schemas.TaskUpdate
) -> Optional[models.Task]:
    db_task = get_task(db, task_id)
    if not db_task:
        return None

    update_data = task.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    # onupdate 트리거가 없는 환경을 위해 명시적 갱신
    db_task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_task)
    logger.info("태스크 수정 완료: id=%s", task_id)
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    db_task = get_task(db, task_id)
    if not db_task:
        return False
    db.delete(db_task)
    db.commit()
    logger.info("태스크 삭제 완료: id=%s", task_id)
    return True
