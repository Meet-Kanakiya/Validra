def test_root_dummy_removed(client):
    response = client.get("/")
    assert response.status_code == 404
