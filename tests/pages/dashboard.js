import Result from "../components/Result"
import {
    HStack,
    Text,
    VStack,
    Heading,
    Button,
    IconButton,
    Tooltip,
    SimpleGrid,
    GridItem,
    Skeleton,
    Box,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Badge,
    Stack,
    Radio, Tag, Textarea, Divider,
} from "@chakra-ui/react";
import {AddIcon, ArrowBackIcon, ExternalLinkIcon, InfoOutlineIcon} from "@chakra-ui/icons";
import React from "react";
import User from '/components/User'
import Link from 'next/link'
import axios from "axios";
import { GoEyeClosed } from "react-icons/go";
import { AiOutlineClockCircle, AiOutlineCheck, AiOutlineClose, AiOutlineWarning } from 'react-icons/ai'
export default function Dashboard(props) {
    const [info, setInfo] = React.useState(false)
    const [preTest, setPreTest] = React.useState(false)
    const [results, setResults] = React.useState(false)
    React.useEffect(() => {
        axios.get('/api/dashboard').then(({data}) => {
            setInfo(data)
        })
    }, [])
    return (
        <>
            <main>
                <VStack spacing={4} justify={"center"} mt={10}>
                    <User {...props} />
                    <HStack my={5}>
                        <Tooltip label={"Вернуться"}>
                            <Link href={'/'}><IconButton icon={<ArrowBackIcon />} /></Link>
                        </Tooltip>
                        {props.user.permissions.length > 0 && <Link href={'/tests'}><Button leftIcon={<ExternalLinkIcon />}>{props.user.permissions.includes('admin') ? 'Все тесты' : 'Мои тесты'}</Button></Link>}
                    </HStack>
                </VStack>
                <SimpleGrid columns={2}>
                    <GridItem colSpan={1}>
                        <Heading my={5} fontWeight={600} align={'center'}>Доступные тесты</Heading>
                        <Skeleton isLoaded={info}>
                            <Text align={'center'} color={'gray.400'}>{info.tests?.length == 0 && 'Пока здесь ничего нет.'}</Text>
                            <VStack spacing={2}>
                                {info.tests?.map(t => (
                                    <Tooltip label={'Пройти тест'}>
                                        <Box bg={'gray.800'} borderWidth={t.color ? '1.5px' : '0px'} style={{ borderColor: t.color ? t.color : '' }} borderRadius={'lg'} cursor={'pointer'} onClick={() => setPreTest(t)}>
                                            {t.cover && <img src={`/api/uploads/${t.cover}`} style={{ borderRadius: '0.5rem 0.5rem 0 0', width: '40ch' }} />}
                                            <Box p={4}>
                                                <Heading fontWeight={600} size={'md'}>{t.name}</Heading>
                                                <Text color={'gray.400'}>Время прохождения: до {t.time/60} минут.</Text>
                                                {t.access.type == 0 && <Text color={'yellow.400'}><AiOutlineWarning style={{ display: 'inline-block' }} /> Необходим запрос на прохождение</Text>}
                                            </Box>
                                        </Box>
                                    </Tooltip>
                                ))}
                            </VStack>
                        </Skeleton>
                    </GridItem>
                    <GridItem colSpan={1} align={'center'}>
                        <Heading my={5} fontWeight={600}>Результаты тестов</Heading>
                        <Skeleton isLoaded={info}>
                            <Text color={'gray.400'}>{info.results?.length == 0 && 'Пока здесь ничего нет.'}</Text>
                            <VStack spacing={2}>
                                {info.results?.map(r => (
                                    <Box onClick={() => {
                                        axios.get(`/api/result?id=${r.id}`).then(({data}) => {
                                            setResults(data)
                                        })
                                    }} bg={'gray.800'} p={4} cursor={'pointer'} borderRadius={'md'} borderColor={r.status == 2 ? 'yellow.300' : r.status == 3 ? 'green.300' : r.status == 4 ? 'red.300' : 'gray.400'} borderWidth={1} borderStyle={'solid'}>
                                        <VStack spacing={2}>
                                            <Heading fontWeight={600} size={'md'} textAlign={'left'}>
                                                {r.testInfo.name}
                                            </Heading>
                                            <Text align={"left"}>
                                                <Text display={'flex'} color={r.status == 2 ? 'yellow.300' : r.status == 3 ? 'green.300' : r.status == 4 ? 'red.300' : 'gray.400'}><Text mt={1} mr={1}>{r.status == 2 ? <AiOutlineClockCircle /> : r.status == 3 ? <AiOutlineCheck /> : r.status == 4 ? <AiOutlineClose /> : <GoEyeClosed />}</Text> {r.status == 2 ? 'На рассмотрении' : r.status == 3 ? 'Пройден' : r.status == 4 ? 'Не пройден' : 'Обнулён'}</Text>
                                                {r.answers.filter(e => e.type == 0).length > 0 && <Text color={'gray.300'}>В теории набрано баллов {r.answers.filter(e => e.type == 0 && e.correct == 1).length}/{r.answers.filter(e => e.type == 0).length}, {Math.round(r.answers.filter(e => e.type == 0 && e.correct == 1).length/r.answers.filter(e => e.type == 0).length*100)}%</Text>}
                                                {r.answers.filter(e => e.type == 1).length > 0 && r.status != 2 &&<Text color={'gray.300'}>В практике набрано баллов {r.answers.filter(e => e.type == 1 && e.correct == 1).length}/{r.answers.filter(e => e.type == 1).length}, {Math.round(r.answers.filter(e => e.type == 1 && e.correct == 1).length/r.answers.filter(e => e.type == 1).length*100)}%</Text>}
                                            </Text>
                                        </VStack>
                                    </Box>
                                ))}
                            </VStack>
                        </Skeleton>
                    </GridItem>
                </SimpleGrid>
            </main>
            <AlertDialog isOpen={preTest} onClose={() => setPreTest(false)}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Тестирование ({preTest.name})
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Пожалуйста, перед началом прохождения убедитесь, что ближайшие {preTest.time/60} минут Вы сможете находиться в этом окне.
                            <br/>
                            <Text color={'red.300'}>Не сворачивайте и не переходите ни в какие окна при прохождении тестирования, иначе он будет зачтен как не пройденный.</Text>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button colorScheme='cyan' onClick={() => window.location.href = `/pass/${preTest.id}`} ml={3}>
                                Начать
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            {results && <Modal size={'2xl'} isOpen={results} onClose={() => setResults(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Результаты теста</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {results.result.answers.map(answer => {
                            let question = results.questions.find(e => e.id == answer.id);
                            if(!question) return;
                            return (<Box>
                                <Heading size={'md'}>{question.question}</Heading>
                                {question.type == 0 ? <>
                                    <Stack mt={2}>
                                        {question.answers.map((an, index) => (
                                            <Radio colorScheme={answer.correctAnswer.includes(index) ? 'green' : 'red'} isChecked={answer.correctAnswer.length == 1 ? answer.answer == index : answer.correctAnswer.length > 1 && answer.answer.includes(index)}>{an} {answer.correctAnswer.includes(index) && <Tag colorScheme={'green'} ml={2}>Правильный ответ</Tag>}</Radio>
                                        ))}
                                    </Stack>
                                </> : <Textarea mt={3} value={answer.answer} />}
                                <Divider my={3} />
                            </Box>)
                        })}
                    </ModalBody>
                </ModalContent>
            </Modal>}
        </>
    );
}