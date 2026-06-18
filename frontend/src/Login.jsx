import "./Login.css";
import { z } from "zod";
import { useState } from "react";

let userschema = z.string().min(3, "username must need 6 characters minimum").max(16, "max length should be 16 chacaters")
let passchema = z.string().min(6, " must need 6 characters minimum").max(16, "max length should be 16 chacaters")

//helper function
function validate(schema, value) {
  if (!value)
    return ""

  let result = schema.safeParse(value)
  if (result.success)
    return "valid"
  return result.error.issues[0].message
}

function Login() {
  const [username, setusername] = useState('')//intial value is empty, the set uername update with the username
  const [password, setPassword] = useState("");

  let senddetails = async (event) => {
    event.preventDefault();
    try {
      let response = await fetch('https://tune-talent.onrender.com/auth/login',
        {
          method: 'POST',
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            username,
            password,
          })
        }
      );

      let data = await response.json();

      let token = data.auth_token
      localStorage.setItem("auth_token", token)
      alert(data.msg);

    } catch (error) {
      console.log(error);
    }
  };

  return (<>
    <form onSubmit={senddetails}>
      <h2>Login</h2>
      <input value={username} onChange={(e) => { setusername(e.target.value); }} type="text" placeholder="Enter the username" />
      <p>{validate(userschema, username)}</p>

      <input value={password} onChange={(e) => { setPassword(e.target.value); }} type="password" placeholder="Enter the password" />
      <p>{validate(passchema, password)}</p>
      <button type="submit">Login</button>
    </form>
  </>)
}

export default Login;