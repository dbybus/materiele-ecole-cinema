import Header from './components/Header';
import LoginForm from './components/LoginForm';

import {useState} from "react";
import axios from "./http-common";

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
    <div className="App">
      <Header />
      {/* <LoginForm onSubmit={getUser}/> */}
      <form>
            <div className="form-inner">
                <h2>Login</h2>
                
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input type="text" name="name" id="name" onChange={(event) => setName(event.target.value)}></input>
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="text" name="email" id="email" onChange={(event) => setEmail(event.target.value)}></input>
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" name="password" id="password"  onChange={(event) => setPassword(event.target.value)}></input>
                </div>
                <button onClick ={getUser}>Create account</button>

            </div>
        </form>
    </div>
  );
}

export default App;
