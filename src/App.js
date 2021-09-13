import Header from './components/Header';
import {useState} from "react";
import axios from "./http-common";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from './components/Login';
import "./css/Login.css";

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
      <Header />
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
        </Switch>
      </Router>
    </div>  

  );
}

export default App;
