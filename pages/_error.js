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

// import { useRouter } from 'next/router'
// import { useEffect } from 'react'
// import Link from 'next/link'
// import Navbar from '../components/layout/Navbar'

// const Error = ({ statusCode }) => {
//   const router = useRouter()
//   useEffect(() => {
//     setTimeout(() => {
//       router.back()
//     }, 3000)
//   }, [])

//   return (
//     <>
//       <Navbar />
//       {statusCode ? (
//         <p>
//           {statusCode === 404 ? (
//             <div className="not-found">
//               <h2>This page cannot be found :(</h2>
//               <p>You will be redirected to previous page in 3 seconds...</p>
//               <p>
//                 Go back to the{' '}
//                 <Link href="/">
//                   <a>Homepage</a>
//                 </Link>
//               </p>
//             </div>
//           ) : (
//             `An error ${statusCode} occurred on server`
//           )}
//         </p>
//       ) : (
//         'An error occurred on client'
//       )}
//     </>
//   )
// }

// Error.getInitialProps = ({ res, err }) => {
// //   const statusCode = res ? res.statusCode : err ? err.statusCode : 404

//     const cerr = err? err.statusCode : 404
//     const statusCode = res ? res.statusCode : cerr

//   return { statusCode }
// }

// export default Error
