import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Alert from '../components/alert'
import {
  FormContainer,
  Input,
  Label,
  FormControl,
  Btn
} from '../components/formComponents'
import { login, loadUser } from '../redux/actions/authActions'
import { clearErrors } from '../redux/actions/errorActions'
import { connect } from 'react-redux'

const Login = props => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const token_verified = () => {
    if (props.isAuthenticated) {
      props.loadUser()
      router.push('/')
    }
  }

  useEffect(() => token_verified(), [props.isAuthenticated])
  const handleSubmit = e => {
    const user = {
      email,
      password
    }
    props.login(user)
    e.preventDefault()
  }
  return (
      <section className='my-8 pt-14'>
        <FormContainer>
          <FormControl>
            <Label>E-mail</Label>
            <Input
              type='email'
              required
              onChange={e => setEmail(e.target.value)}
            />
            <Label>Password</Label>
            <Input
              type='password'
              required
              onChange={e => setPassword(e.target.value)}
            />
            <div className='flex items-center justify-between'>
              <Btn type='button' onClick={handleSubmit} className='bg-blue-500'>
                <span className='inline-block mr-2 uppercase'>Login</span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  className='inline-block w-4 h-4'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </Btn>
              <div>
                <a href='#' className='inline-block underline'>
                  Forgot Password
                </a>
              </div>
            </div>
          </FormControl>
        </FormContainer>
      </section>
  )
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  error: state.error
})
export default connect(mapStateToProps, { login, loadUser, clearErrors })(Login)
