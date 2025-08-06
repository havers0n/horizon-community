import {
    useToast,
    Flex,
    Box,
    Text,
    Heading,
    Button,
    SimpleGrid,
    GridItem,
    Spinner,
    Stack,
    Radio,
    RadioGroup,
    Textarea,
    Checkbox,
    CheckboxGroup,
    useDisclosure, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogHeader, AlertDialogOverlay, AlertDialogFooter
} from "@chakra-ui/react";
import React from "react";
import axios from "axios";
import Countdown from 'react-countdown';
import { useRouter } from 'next/router'
import { AiOutlineClockCircle } from 'react-icons/ai'
import moment from 'moment'
export default function Testing(props) {
    const toast = useToast()
    const [info, setInfo] = React.useState(false)
    const [q, setQ] = React.useState(0)
    const [answers, setAnswers] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()
    const { isOpen, onToggle } = useDisclosure()
    const input = React.useRef()
    const KA = () => {
        setTimeout(KA, 5000)
        axios.get(`/api/tests/${router.query.id}/passing/ka`, { result: info.id }).then(({data}) => {
            if(data.error) return window.location.href = '/dashboard'
            else if(data.status != 0 && data.status != 1) return window.location.href = '/dashboard'
            else if(moment.unix(data.end) <= moment()) {
                axios.post(`/api/tests/${info.testId}/passing/end`, { answers: answers, result: info.id }).then(({data}) => {
                    window.location.href = '/dashboard'
                })
            }
            setInfo(data)
        })
    }
    React.useEffect(() => {
        axios.get(`/api/tests/${router.query.id}/passing/start`).then(({data}) => {
            setInfo(data)
            KA()
        }).catch(err => {
            window.location.href = '/dashboard'
        })
        window.onblur = function () {
            axios.get(`/api/tests/${router.query.id}/passing/sec`, { result: info.id }).then(({data}) => {
                if(data.warned == 0) {
                    onToggle()
                } else {
                    window.location.href = '/dashboard'
                }
            })
        }
    }, [])
    return (
        <>
            <main style={{ backgroundColor: info && info.testInfo.color ? info.testInfo.color : '' }}>
                <Flex minH={'100vh'} align={'center'} justify={'center'}>
                    <Box bg={'gray.700'} rounded={'lg'}>
                        {info && info.testInfo.cover && <img src={`/api/uploads/${info.testInfo.cover}`} style={{ maxWidth: '30vw', borderRadius: '0.5rem 0.5rem 0 0' }} />}
                        <Box p={4}>
                            {info && info.status == 1 ? (() => {
                                let question = info.answers[q];
                                if(!question) return;
                                return (<SimpleGrid columns={6} spacing={8}>
                                    {question.image && <GridItem colSpan={6} align={'center'}>
                                        <img src={`/api/uploads/${question.image}`} style={{ maxHeight: 200 }} />
                                    </GridItem>}
                                    <GridItem colSpan={5}>
                                        <Heading fontWeight={600} size={'md'}>{question.question}</Heading>
                                    </GridItem>
                                    <GridItem colSpan={1}>
                                        <Text color={'gray.400'}>{q+1} из {info.answers.length}</Text>
                                    </GridItem>
                                    <GridItem colSpan={6}>
                                        {question.type == 0 ? <>
                                            {question.count < 2 ? <RadioGroup onChange={(e) => {
                                                let arr = answers;
                                                arr[q] = Number(e);
                                                setAnswers([...arr])
                                            }} value={answers[q]}>
                                                <Stack>
                                                    {question.answers.map((an, index) => (
                                                        <Radio size='lg' value={index}>
                                                            {an}
                                                        </Radio>
                                                    ))}
                                                </Stack>
                                            </RadioGroup> : <>
                                                <Stack>
                                                    {question.answers.map((an, index) => (
                                                        <Checkbox value={index} onChange={(e) => {
                                                            let arr = answers;
                                                            if(!arr[q]) arr[q] = []
                                                            if(e.target.checked) {
                                                                arr[q] = [...arr[q], index]
                                                            } else {
                                                                arr[q] = [...arr[q].filter(e => e != index)]
                                                            }
                                                            setAnswers([...arr])
                                                        }}>
                                                            {an}
                                                        </Checkbox>
                                                    ))}
                                                </Stack>
                                            </>}
                                        </> : <>
                                            <Textarea placeholder={'Ответ'} ref={input} value={answers[q] || ''} onChange={(e) => {
                                                let arr = answers;
                                                arr[q] = e.target.value;
                                                setAnswers([...arr])
                                                input.current.value = ''
                                            }} />
                                        </>}
                                    </GridItem>
                                    <GridItem colSpan={3}>
                                        <Countdown renderer={({ hours, minutes, seconds, completed }) => {
                                            return (
                                                <Heading size={'md'} display={'flex'} mt={2} color={minutes < 10 ? 'yellow.300' : 'green.300'}>
                                                    <AiOutlineClockCircle style={{ marginTop: 2, marginRight: 5 }} />
                                                    {minutes}:{seconds}
                                                </Heading>)
                                        }} date={moment.unix(info.end).valueOf()} />
                                    </GridItem>
                                    <GridItem colSpan={3} align={'right'}>
                                        <Button isLoading={loading} onClick={() => {
                                            if(q+1 == info.answers.length) {
                                                if(answers.length != info.answers.length) return toast({ status: 'error', title: 'Количество ответов не соответствует количеству вопросов' })
                                                setLoading(true)
                                                axios.post(`/api/tests/${info.testId}/passing/end`, { answers: answers, result: info.id }).then(({data}) => {
                                                    window.location.href = '/dashboard'
                                                })
                                            } else {
                                                if(answers[q] === undefined) return toast({ status: 'error', title: 'Сначало заполните вопрос' })
                                                setQ(false)
                                                setTimeout(() => {
                                                    setQ(q+1)
                                                }, 100)
                                            }
                                        }}>{q+1 == info.answers.length ? 'Завершить' : 'Дальше'}</Button>
                                    </GridItem>
                                </SimpleGrid>)
                            })() : info && info.status == 0 ? <>
                                <Heading align={'center'}><Spinner /></Heading>
                                <Heading align={'center'} fontWeight={600}>Доступ запрошен</Heading>
                                <Text align={'center'}>Как только он будет одобрен - тест начнется.</Text>
                            </> : <Spinner />}
                        </Box>
                    </Box>
                </Flex>
            </main>
            <AlertDialog isOpen={isOpen} onClose={onToggle}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Вы свернулись
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Мы же предупреждали: сворачиваться нельзя. Но сейчас, в первый раз, мы закроем на это глаза. Впредь не делайте так, или ваш тест будет аннулирован.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button colorScheme='blue' onClick={onToggle} ml={3}>
                                Продолжить
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}