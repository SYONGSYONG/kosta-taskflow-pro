"""
CRUD 5개 엔드포인트 테스트
각 엔드포인트마다 정상(happy path) / 404 / 400 케이스 포함
"""


# ── POST /api/tasks ──────────────────────────────────────────
def test_create_task_success(client):
    res = client.post("/api/tasks", json={"title": "기획서 초안"})
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "기획서 초안"
    assert data["status"] == "todo"
    assert "id" in data
    assert "description" in data


def test_create_task_with_all_fields(client):
    payload = {
        "title": "마감 있는 태스크",
        "description": "설명 텍스트",
        "status": "in_progress",
        "due_at": "2026-06-01T18:00:00Z",
    }
    res = client.post("/api/tasks", json=payload)
    assert res.status_code == 201
    assert res.json()["description"] == "설명 텍스트"


def test_create_task_missing_title(client):
    res = client.post("/api/tasks", json={})
    assert res.status_code == 400


def test_create_task_empty_title(client):
    res = client.post("/api/tasks", json={"title": "   "})
    assert res.status_code == 400


def test_create_task_title_too_long(client):
    res = client.post("/api/tasks", json={"title": "x" * 201})
    assert res.status_code == 400


def test_create_task_invalid_status(client):
    res = client.post("/api/tasks", json={"title": "태스크", "status": "invalid"})
    assert res.status_code == 400


def test_create_task_invalid_due_at(client):
    res = client.post("/api/tasks", json={"title": "태스크", "due_at": "not-a-date"})
    assert res.status_code == 400


# ── GET /api/tasks ────────────────────────────────────────────
def test_list_tasks_empty(client):
    res = client.get("/api/tasks")
    assert res.status_code == 200
    assert res.json() == []


def test_list_tasks_returns_items(client):
    client.post("/api/tasks", json={"title": "태스크 1"})
    client.post("/api/tasks", json={"title": "태스크 2"})
    res = client.get("/api/tasks")
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_list_tasks_excludes_description(client):
    client.post("/api/tasks", json={"title": "태스크", "description": "설명"})
    res = client.get("/api/tasks")
    assert res.status_code == 200
    assert "description" not in res.json()[0]


# ── GET /api/tasks/{id} ───────────────────────────────────────
def test_get_task_success(client):
    create_res = client.post(
        "/api/tasks", json={"title": "단건 태스크", "description": "설명"}
    )
    task_id = create_res.json()["id"]
    res = client.get(f"/api/tasks/{task_id}")
    assert res.status_code == 200
    assert res.json()["description"] == "설명"


def test_get_task_not_found(client):
    res = client.get("/api/tasks/9999")
    assert res.status_code == 404


# ── PUT /api/tasks/{id} ───────────────────────────────────────
def test_update_task_success(client):
    create_res = client.post("/api/tasks", json={"title": "원래 제목"})
    task_id = create_res.json()["id"]
    res = client.put(f"/api/tasks/{task_id}", json={"status": "done"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "done"
    assert data["title"] == "원래 제목"  # 미전송 필드 유지 확인


def test_update_task_partial(client):
    create_res = client.post(
        "/api/tasks", json={"title": "원래", "description": "설명"}
    )
    task_id = create_res.json()["id"]
    res = client.put(f"/api/tasks/{task_id}", json={"title": "수정된 제목"})
    assert res.status_code == 200
    assert res.json()["description"] == "설명"  # description 유지


def test_update_task_not_found(client):
    res = client.put("/api/tasks/9999", json={"status": "done"})
    assert res.status_code == 404


def test_update_task_invalid_status(client):
    create_res = client.post("/api/tasks", json={"title": "태스크"})
    task_id = create_res.json()["id"]
    res = client.put(f"/api/tasks/{task_id}", json={"status": "invalid"})
    assert res.status_code == 400


# ── DELETE /api/tasks/{id} ────────────────────────────────────
def test_delete_task_success(client):
    create_res = client.post("/api/tasks", json={"title": "삭제될 태스크"})
    task_id = create_res.json()["id"]
    res = client.delete(f"/api/tasks/{task_id}")
    assert res.status_code == 204


def test_delete_task_not_found(client):
    res = client.delete("/api/tasks/9999")
    assert res.status_code == 404


def test_delete_task_gone_after_delete(client):
    create_res = client.post("/api/tasks", json={"title": "삭제 확인"})
    task_id = create_res.json()["id"]
    client.delete(f"/api/tasks/{task_id}")
    res = client.get(f"/api/tasks/{task_id}")
    assert res.status_code == 404
