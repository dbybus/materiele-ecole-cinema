import Header from './components/Header';
import {useState} from "react";
import axios from "./http-common";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import Reset from './components/Reset';
import Dashboard from './components/Dashboard';
import "./css/Login.css";
import NavBar from './components/NavBar';
import AddMateriele from './components/AddMateriele';
import ListMateriele from './components/ListMateriele';
import Agenda from './components/Agenda';

function App() {

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [isAdmin, setIsAdmin] = useState("")

  const getUser = () => {
    console.log(name);

    axios.post('http://localhost:3001/api/users', {
      
      name: name,
      password: password,
      email: email,
      isAdmin: isAdmin
    })
  }

  return (
    <div className="app">
      <NavBar />
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/reset" component={Reset} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/addmateriele" component={AddMateriele} />
          <Route exact path="/listmateriele" component={ListMateriele} />
          <Route exact path="/agenda" component={Agenda} />
        </Switch>
      </Router>
    </div>  

  );
}

export default App;
