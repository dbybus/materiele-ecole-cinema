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

  //Not woriking upload getFiles image through the services to see how resolve it later / giving the error
  //for the moment I am using axios directly
  upload(file) {
    console.log(file);
    return http.post('/materiele', file, {
      headers:{
        'content-type': 'multipart/form-data'
      }
    });
  }

  getFiles() {
    return http.get("/materiele");
  }
}

export default new MaterieleDataService();