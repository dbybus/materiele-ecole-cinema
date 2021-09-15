import http from "../http-common";

class MaterieleDataService {
  getAll() {
    return http.get("/materiele");
  }

  get(id) {
    return http.get(`/materiele/${id}`);
  }

  create(data) {
    return http.post("/materiele", data);
  }

  update(id, data) {
    return http.put(`/materiele/${id}`, data);
  }

  delete(id) {
    return http.delete(`/materiele/${id}`);
  }

  deleteAll() {
    return http.delete(`/materiele`);
  }

  findByTitle(name) {
    return http.get(`/materiele?name=${name}`);
  }
}

export default new MaterieleDataService();