import http from "../http-common";
var axios = require("axios").default;

class ReservationDataService {
  getAll(token) {
    return http.get("/reservation/findAll", {
      headers:{
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
        'Authorization': `Bearer ${token}`
      }
    })
  }

  get(id, token) {
    return http.get(`/reservation/findOne/${id}`, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async create(data, token) {
    return http.post("/reservation/create", data, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    })
      .then(result => {
        // Handle result…
        console.log(result.data);
      }).catch((e) => {
          console.log(e);
          alert(e)
      });
  }

  update(id, data, token) {
    return http.put(`/reservation/update/${id}`, data, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });
  }

  delete(id, token) {
    return http.delete(`/reservation/delete/${id}`, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

export default new ReservationDataService();