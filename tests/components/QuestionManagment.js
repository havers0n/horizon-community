import {Box, SimpleGrid, GridItem, Heading, Text, IconButton, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, Portal, PopoverCloseButton, Button} from "@chakra-ui/react";
import {BsFillTrashFill, BsPencilFill} from "react-icons/bs";
import axios from 'axios'
export default function QuestionManagment({ info, test, setInfo, setEdit }) {
    return (
        <Box p={4} my={5} background={'gray.800'} rounded={'2xl'}>
            <SimpleGrid columns={2}>
                <GridItem spacing={0}>
                    <Heading fontWeight={600} size={'md'}>
                        {info.question}
                    </Heading>
                    <Text>
                        {info.type == 0 ? 'Тестовый вопрос (теория)' : 'Письменный вопрос (практика)'}
                    </Text>
                </GridItem>
                <GridItem align={'end'}>
                    <IconButton icon={<BsPencilFill />} mr={2} colorScheme={"cyan"} variant={"outline"} onClick={() => setEdit({ state: true, ...info }) } />
                    <Popover>
                        {({ isOpen, onClose }) => (
                                <>
                                <PopoverTrigger>
                                    <IconButton isDisabled={isOpen} colorScheme ={'red'} variant={"outline"} icon={<BsFillTrashFill />} />
                                </PopoverTrigger>
                                <Portal>
                                    <PopoverContent>
                                        <PopoverHeader>Подтверждение</PopoverHeader>
                                        <PopoverCloseButton />
                                        <PopoverBody>
                                            <Text>Вы уверены, что хотите удалить вопрос?</Text>
                                            <Button colorScheme={'red'} mt={3} onClick={() => {
                                                axios.post(`/api/tests/${test.id}/questions/remove`, { question: info.id }).then(({data}) => {
                                                    setInfo({...test, questions: [...test.questions.filter(e => e.id != info.id)] })
                                                    onClose()
                                                })
                                            }}>Удалить</Button>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Portal>
                                </>
                                )}
                    </Popover>
                </GridItem>
            </SimpleGrid>
        </Box>
    );
}