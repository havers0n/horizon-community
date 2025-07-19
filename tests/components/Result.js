import {VStack, HStack, Heading, Text, Button} from "@chakra-ui/react";
import {FaCheck, FaInfoCircle} from "react-icons/fa";
import { InfoOutlineIcon, DeleteIcon } from "@chakra-ui/icons";

export default function Result() {
    return (
        <HStack spacing={3} style={{padding: 10, backgroundColor: "#22232b", borderRadius: 5, border: "1px solid #00E676"}}>
            <VStack spacing={0}>
                <Heading style={{width: "100%", textAlign: "left", color: "#999", fontSize: "18px"}}>
                    Вступительный тест SAHP
                </Heading>
                <Text align={"left"}>
                    <span style={{color: "#00E676", display: "inline-block"}}><FaCheck style={{display: "inline-block"}} /> Пройден</span>
                    <span style={{color: "#ddd"}}>, набрано баллов 9/10, 90%</span>
                    <br/>
                    <span style={{color: "#aaa", display: "inline-block"}}><FaInfoCircle style={{display: "inline-block"}} /> Комментарий:</span>
                    &nbsp;
                    <span style={{color: "#ddd"}}>ты что тупой</span>
                </Text>
            </VStack>
            <VStack>
                <Button leftIcon={<InfoOutlineIcon />} colorScheme={"blue"} variant={"outline"}>Ответы</Button>
            </VStack>
        </HStack>
    );
}
