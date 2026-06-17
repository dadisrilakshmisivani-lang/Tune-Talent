import React from 'react'
import { useState } from "react"
import {z} from "zod"
let userschema=z.string().min(6,"username must need min 6characters").max(16,'max limit 16 characters')
let passwordchema=z.string().min(8,"username must need min 8characters").max(16,'max limit 16 characters')
let emailschema=z.email().min(3,"min charcters 3")

function validate(schema,value){
  if(!value) return ""
 let result= schema.safeParse(value)
 if(result.success) return ""
 return result.error.issues[0].message
}


function Register() {
  const [username, setusername] = useState('')
  const [password, setpassword] = useState('')
  const [email, setemail] = useState('')

    let Details = async (e) =>{
        e.preventDefault();
        let response = await fetch('http://localhost:3000/Register' , {
            method:'Post',
            headers:{
            "Content-Type": "application/json"
        },
        body:JSON.stringify({username,email,password})
        })
    let data=await  response.json()
    let token=data.token
    localStorage.setItem("token",token)
    alert(data.msg)
    }
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100">
        <form onSubmit={Details} id='form' className="bg-white p-6 rounded-lg shadow-md w-80">
        <h1 className="text-2xl font-bold text-center mb-4">Registration</h1>

            <input className="w-full p-2 mb-3 border rounded"    onChange={(e) => {setusername(e.target.value)}}  type="text" placeholder="Username" /><br />
            <input className="w-full p-2 mb-3 border rounded" onChange={(e) => {setemail(e.target.value)}}   type="email" placeholder="Email" /><br />
            <input className="w-full p-2 mb-3 border rounded" onChange={(e) => {setpassword(e.target.value)}}  type="password" placeholder="password" /><br />
            <button className="w-full bg-blue-600 text-white p-2 rounded bg-sky-500 hover:bg-sky-700 ..." id='button' type='submit'>Register</button>
        </form>
    </div>
  )
}

export default Register