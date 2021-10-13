import http from "../http-common";

class MaterieleDataService {
  getAll() {
    return http.get("/materiele/findAll");
  }

  get(id) {
    return http.get(`/materiele/findOne/${id}`);
  }

  async create(data) {
    return http.post("/materiele/create", data)
      .then(result => {
        // Handle result…
        console.log(result.data);
      }).catch((e) => {
          console.log(e);
          alert(e)
      });
  }

  update(id, data) {
    return http.put(`/materiele/update/${id}`, data);
  }

  delete(id) {
    return http.delete(`/materiele/delete/${id}`);
  }

  deleteAll() {
    return http.delete(`/materiele/deleteAll`);
  }

  async uploadImgMat(file) {
    console.log(file);
    return http.post('/materiele/uploadImgMat', file, {
      headers:{
        'content-type': 'multipart/form-data',
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
      }
    }).then(result => {
        // Handle result…
        console.log(result.data);
    }).catch((e) => {
        console.log(e);
        alert(e)
    });
  }

  getFiles() {
    return http.get("/materiele");
  }

  deleteImgMat(data) {
    return http.post('/materiele/deleteImgMat', data, {
      headers:{
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
      }
    });
  }
}

export default new MaterieleDataService();