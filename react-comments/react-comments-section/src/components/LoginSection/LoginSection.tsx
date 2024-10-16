import React from 'react'
import './LoginSection.scss'

interface LoginSectionProps {
  loginLink: string
  signUpLink: string
  onLogin?: Function
  onSignup?: Function
}

const LoginSection: React.FC<LoginSectionProps> = (props) => {

  const { loginLink, signUpLink, onLogin, onSignup } = props

  const login = () =>{
    console.log("onLogin :", loginLink, signUpLink)
    onLogin && onLogin();
  }

  const signup = () =>{
    console.log("onLogin :", loginLink, signUpLink)
    onSignup && onSignup();
  }

  return (
    <div className='signBox'>
      <div className='signLine'>Log in or sign up to leave a comment</div>
      <div>
        {/* <a href={loginLink}> */}
          <button onClick={login} className='loginBtn' name='login'>
            Log In
          </button>
        {/* </a>
        <a href={signUpLink}> */}
          <button onClick={signup} className='signBtn' name='signup'>
            Sign Up
          </button>
        {/* </a> */}
      </div>
    </div>
  )
}

export default LoginSection
