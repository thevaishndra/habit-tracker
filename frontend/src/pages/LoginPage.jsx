import React, { useState } from 'react'

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
  return (
    <div>
      <div></div>
      <div data-theme="valentine" className="">
        <div>
          <div>
            <h1>CycleCare</h1>
            <p>Sign in to your account</p>
          </div>

          <form>
            {/*email*/}
            <div></div>

            {/*password*/}
            <div>{/*show password button*/}</div>

            {/*submit button*/}
            <button></button>
            
            <div>
                <p>Don't have an account?
                    <Link>Create account</Link>
                </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage