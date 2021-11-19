import '../styles/globals.css'
import Segment from "../src/SegmentAnalytics"

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Segment />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
