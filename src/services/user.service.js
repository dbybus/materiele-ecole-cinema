import http from "../http-common";
var axios = require("axios").default;

class UserDataService {
  getAll() {
    return axios.get(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users`, {
      headers: {
        'Authorization' : `Bearer ${process.env.REACT_APP_AUTH0_API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    })
  }

  get(id) {
    return http.get(`/users/${id}`);
  }

  create(data) {
    return http.post("/users", data);
  }

  update(id, data) {
    return http.put(`/users/${id}`, data);
  }

  delete(id) {
    return http.delete(`/users/${id}`);
  }

  deleteAll() {
    return http.delete(`/users`);
  }

  findByTitle(name) {
    return http.get(`/users?name=${name}`);
  }
}

export default new UserDataService();