import { ChakraProvider, extendTheme, Spinner, Flex, ColorModeScript } from '@chakra-ui/react'
import '../styles/globals.css'
import axios from 'axios';
import React from 'react'
import moment from 'moment'
import 'moment/locale/ru'
import Head from "next/head";
axios.defaults.baseUrl = process.env.NEXT_PUBLIC_BASE_URL

const theme = extendTheme({
  initialColorMode: 'dark',
  styles: {
    global: {
      body: {
        bg: '#14151b',
      }
    }
  }
})

function MyApp({ Component, pageProps }) {
  const [user, setUser] = React.useState(false);
  React.useEffect(() => {
    axios.get('/api/init').then(({data}) => {
      setUser(data)
    }).catch(err => {
      window.location.href = process.env.NEXT_PUBLIC_FORUM_URL
    })
  }, [])
  return (<ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode={'dark'} />
    <Head>
      <title>{process.env.NEXT_PUBLIC_NAME}</title>
      <link rel={"icon"} href={`${process.env.NEXT_PUBLIC_BASE_URL}favicon.png`} />
    </Head>
    {user ? <Component user={user} {...pageProps} /> : <Flex minH={'100vh'} align={'center'} justify={'center'}>
      <Spinner />
    </Flex>}
  </ChakraProvider>)
}

export default MyApp
