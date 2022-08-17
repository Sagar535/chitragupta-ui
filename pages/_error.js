import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'

const Error = ({ statusCode }) => {
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      router.back()
    }, 3000)
  }, [])

  return (
    <>
      <Navbar />
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    </>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const cerr = err ? err.statusCode : 404
  const statusCode = res ? res.statusCode : cerr
  return { statusCode }
}

export default Error
