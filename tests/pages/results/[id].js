import {
    HStack,
    Text,
    VStack,
    Heading,
    Button,
    IconButton,
    Tooltip,
    Input,
    Stack,
    Skeleton,
    Box, Badge, Radio, Textarea, Tag
} from "@chakra-ui/react";
import {InfoOutlineIcon, ArrowBackIcon, EditIcon} from "@chakra-ui/icons";
import React from "react";
import Link from 'next/link'
import User from '/components/User'
import Router, {useRouter} from 'next/router'
import axios from 'axios'
import moment from 'moment'

export default function Results(props) {
    const [info, setInfo] = React.useState(false);
    const router = useRouter()
    React.useEffect(() => {
        axios.get(`/api/admin/results/${router.query.id}`).then(({data}) => {
            setInfo(data)
        })
    }, [])
    return (
        <>
            <main>
                <VStack spacing={2} justify={"center"} style={{paddingTop: 15}}>
                    <User {...props} />
                    <HStack mb={5}>
                        <Tooltip label={"Вернуться"}>
                            <Link href={'/results'}><IconButton icon={<ArrowBackIcon />} /></Link>
                        </Tooltip>
                    </HStack>
                    <Skeleton isLoaded={info}>
                        {info && <Box align={'center'}>
                            <Heading fontWeight={600} size={'lg'} mt={2}>{info.result.name} – {info.result.testInfo.name}</Heading>
                            <Badge colorScheme={info.result.status == 2 ? 'yellow' : info.result.status == 3 ? 'green' : info.result.status == 4 ? 'red' : 'gray'}>{info.result.status == 2 ? 'Ожидает рассмотрения' : info.result.status == 3 ? 'Пройден' : info.result.status == 4 ? 'Не пройден' : 'Обнулен'}</Badge>
                            <Text>{moment.unix(info.result.start).format('lll')}</Text>
                            {info.result.answers.filter(e => e.type == 0).length > 0 && <Text>Теория: {info.result.answers.filter(e => e.type == 0 && e.correct == 1).length}/{info.result.answers.filter(e => e.type == 0).length}, {Math.round(info.result.answers.filter(e => e.type == 0 && e.correct == 1).length/info.result.answers.filter(e => e.type == 0).length*100)}%</Text>}
                            {info.result.answers.filter(e => e.type == 1).length > 0 && <Text>Практика: {info.result.answers.filter(e => e.type == 1 && e.correct == 1).length}/{info.result.answers.filter(e => e.type == 1).length}, {Math.round(info.result.answers.filter(e => e.type == 1 && e.correct == 1).length/info.result.answers.filter(e => e.type == 1).length*100)}%</Text>}
                            <Text>Итого: {Math.round(info.result.answers.filter(e => e.correct == 1).length/info.result.answers.length*100)}%</Text>
                            {[2,3,4,5].map(s => {
                                if(s == info.result.status) return;
                                return (<Button onClick={() => {
                                    axios.post(`/api/admin/results/${info.result.id}/setStatus`, { status: s }).then(({data}) => {
                                        setInfo({...info, result: {...info.result, status: s }  })
                                    })
                                }} mx={2} my={2} colorScheme={s == 2 ? 'yellow' : s == 3 ? 'green' : s == 4 ? 'red' : 'gray'}>{s == 2 ? 'Ожидает рассмотрения' : s == 3 ? 'Пройден' : s == 4 ? 'Не пройден' : 'Обнулен'}</Button>)
                            })}
                            <Heading mt={5}>Ответы</Heading>
                            {info.result.answers.map(answer => {
                                let question = info.questions.find(e => e.id == answer.id);
                                if(!question) return;
                                return (<Box bg={'gray.700'} p={4} rounded={'lg'} my={4} align={'left'}>
                                    <Heading size={'md'}>{question.question}</Heading>
                                    <Tooltip label={'Изменить'}>
                                        <Badge onClick={() => {
                                            axios.post(`/api/admin/results/${info.result.id}/changeCorrect`, { question: answer.id }).then(({data}) => {
                                                let arr = info.result.answers;
                                                arr[arr.findIndex(e => e.id == answer.id)].correct = data.status;
                                                setInfo({...info, result: {...info.result, answers: [...arr] } })
                                            })
                                        }} cursor={'pointer'} colorScheme={answer.correct == 1 ? 'green' : 'red'}>{answer.correct == 1 ? 'Правильный' : 'Неправильный'}</Badge>
                                    </Tooltip>
                                    {question.type == 0 ? <>
                                        <Stack mt={2}>
                                            {question.answers.map((an, index) => (
                                                <Radio colorScheme={answer.correctAnswer.includes(index) ? 'green' : 'red'} isChecked={answer.correctAnswer.length == 1 ? answer.answer == index : answer.correctAnswer.length > 1 && answer.answer.includes(index)}>{an} {answer.correctAnswer.includes(index) && <Tag colorScheme={'green'} ml={2}>Правильный ответ</Tag>}</Radio>
                                            ))}
                                        </Stack>
                                    </> : <Textarea mt={3} value={answer.answer} />}
                                </Box>)
                            })}
                        </Box>}
                    </Skeleton>
                </VStack>
            </main>
        </>
    );
}