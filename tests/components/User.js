import {VStack, HStack, Text, Badge, Box, Avatar} from "@chakra-ui/react";
import Image from "next/image";
import moment from 'moment'
export default function User({user}) {
    return (
        <>
            <HStack spacing={2}>
                <Image src={user.photoUrl} alt={""} width={50} height={50} style={{borderRadius: 100}} />
                <VStack spacing={0} style={{textAlign: "left"}}>
                    <Text align={"left"} style={{color: "#999"}}>
                        Привет, {user.name}
                        <br/>
                        <span style={{color: "#666"}}>{moment().format('lll')}</span>
                    </Text>
                </VStack>
            </HStack>
            <Box>
                {user.permissions.includes('admin') && <Badge colorScheme={'red'} mb={3}>Администратор</Badge>}
                {user.permissions.includes('supervisor') && <Badge mb={3} colorScheme={'yellow'}>Руководство департамента</Badge>}
            </Box>
        </>
);
}