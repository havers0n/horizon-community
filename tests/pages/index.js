import Head from 'next/head'
import Image from 'next/image'
import { Heading, HStack, VStack, Button, Text, Badge } from "@chakra-ui/react"
import User from '/components/User'
import Link from 'next/link'
import React from "react";

export default function Home(props) {
    return (
    <>
      <main>
          <VStack justify={"center"} alignItems={"center"} style={{height: "100%"}}>
              <User {...props} />
              <VStack mt={15} style={{padding: 15, backgroundColor: "#22232b", border: "1px solid #03bfee", borderRadius: 5}}>
                  <Link href={'/dashboard'}><Button colorScheme={'gray'}>Личный кабинет</Button></Link>
                  {props.user.permissions.length > 0 && <Link href={'/results'}><Button colorScheme='blue' variant={"outline"}>Панель результатов</Button></Link>}
              </VStack>
          </VStack>
      </main>
    </>
    )
}
