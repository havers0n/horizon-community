import Result from "/components/Result"
import {
    HStack,
    Text,
    VStack,
    Heading,
    Button,
    IconButton,
    Tooltip,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    ModalHeader,
    ModalCloseButton,
    Skeleton,
    useDisclosure,
    FormControl,
    Input,
    Select,
    SimpleGrid,
    GridItem,
    NumberInput,
    NumberInputField,
    NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper, useToast, Checkbox
} from "@chakra-ui/react";
import {AddIcon, ArrowBackIcon, ExternalLinkIcon} from "@chakra-ui/icons";
import React from "react";
import User from '/components/User'
import Question from '/components/QuestionManagment'
import Router, { useRouter } from 'next/router'
import { AiOutlinePaperClip, AiOutlineClose } from 'react-icons/ai'
import axios from 'axios'
import {Field, Form, Formik} from "formik";
export default function Questions(props) {
    const [info, setInfo] = React.useState(false);
    const [create, setCreate] = React.useState({ state: false })
    const [edit, setEdit] = React.useState({ state: false })
    const [answers, setAnswers] = React.useState([])
    const { isOpen: isOpenCreate, onToggle: onToggleCreate } = useDisclosure()
    const toast = useToast()
    const router = useRouter()
    React.useEffect(() => {
        axios.get(`/api/tests/${router.query.id}/`).then(({data}) => {
            setInfo(data)
        })
    }, [])
    React.useEffect(() => {
        if(create.state) {
            if(answers.length == create.answers) return;
            let a = answers;
            answers.length = create.answers || 1;
            setAnswers([...answers])
        }
    }, [create])
    const createFileUpload = React.useRef()
    const editFileUpload = React.useRef()
    return (
        <>
            <main>
                <VStack spacing={4} justify={"center"} mt={10}>
                    <User {...props} />
                    <HStack my={5}>
                        <Tooltip label={"Вернуться"}>
                            <IconButton onClick={() => Router.push('/tests')} icon={<ArrowBackIcon />} />
                        </Tooltip>
                        <Button leftIcon={<AddIcon />} onClick={() => setCreate({ state: true, correct: [] })}>Новый вопрос</Button>
                    </HStack>
                    <Skeleton isLoaded={info}>
                        <Heading my={5} fontWeight={600}>{info.name} – вопросы</Heading>
                        {info.questions?.map(q => (<Question info={q} test={info} setInfo={setInfo} setEdit={setEdit} />))}
                    </Skeleton>
                </VStack>
            </main>
            {create && <Modal isOpen={create.state} onClose={() => setCreate({ state: false })}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Новый вопрос</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {create.image && <img style={{ marginBottom: 20 }} src={URL.createObjectURL(create.image)} />}
                        <Input variant={'filled'} placeholder={'Вопрос'} value={create.name} onChange={(e) => setCreate({...create, name: e.target.value })} />
                        <Select variant={'filled'} my={3} placeholder={'Тип вопроса'} value={create.type} onChange={(e) => setCreate({...create, type: e.target.value })}>
                            <option value={0}>Тестовый вопрос (теория)</option>
                            <option value={1}>Письменный вопрос (практика)</option>
                        </Select>
                        {create.type == 0 && <>
                            <SimpleGrid columns={3}>
                                <GridItem colSpan={2}>
                                    <Heading size={'md'} my={3}>Варианты ответов</Heading>
                                </GridItem>
                                <GridItem colSpan={1}>
                                    <NumberInput my={2} value={create.answers || 1} min={1} max={10} onChange={(e) => setCreate({...create, answers: e })}>
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </GridItem>
                            </SimpleGrid>
                            {answers.map((a, index) => (
                                <SimpleGrid columns={12}>
                                    <GridItem colSpan={11}>
                                        <Input my={1} placeholder={`Ответ #${index+1}`} value={a} onChange={(e) => {
                                            let arr = answers;
                                            arr[index] = e.target.value;
                                            setAnswers([...arr])
                                        }} />
                                    </GridItem>
                                    <GridItem colSpan={1}>
                                        <Checkbox m={4} isChecked={create.correct.includes(index)} onChange={(e) => {
                                             if(e.target.checked) setCreate({...create, correct: [...create.correct, index] })
                                             else setCreate({...create, correct: [...create.correct.filter(e => e != index)] })
                                        }} />
                                    </GridItem>
                                </SimpleGrid>
                            ))}
                        </>}
                        <Heading fontWeight={600} size={'sm'} mt={6} mb={2}>Изображение</Heading>
                        <IconButton disabled={create.image} onClick={() => createFileUpload.current.click()} icon={<AiOutlinePaperClip />} variant={'ghost'} />
                        {create.image && <IconButton onClick={() => setCreate({...create, image: false})} icon={<AiOutlineClose />} colorScheme={'red'} />}
                        <input
                            type="file"
                            name="myImage"
                            id={'upload-photo'}
                            ref={createFileUpload}
                            style={{ opacity: 0, position: 'absolute', zIndex: '-1' }}
                            onChange={(event) => {
                                setCreate({...create, image: event.target.files[0] })
                            }}
                        />
                        <br/>
                        <Button my={3} colorScheme={'cyan'} onClick={async() => {
                            const update = (data) => {
                                setInfo({...info, questions: [...info.questions, data] });
                                setCreate({ state: false });
                                setAnswers([])
                            }
                            if(create.type == 0 && answers.filter(e => !e).length > 0) return toast({ title: 'Заполните все варианты ответов', status: 'error' })
                            if(!create.name) return toast({ title: 'Заполните все поля', status: 'error' });
                            if(create.image) {
                                const form = new FormData();
                                form.append('image', create.image)
                                axios.post(`/api/image`, form).then(({data: d}) => {
                                    axios.post(`/api/tests/${router.query.id}/questions/add`, { name: create.name, type: create.type, answers: create.type == 0 && answers, correct: create.correct, image: d.url || null }).then(({data}) => update(data))
                                }).catch(err => toast({ status: 'error', title: 'Ошибка при загрузке изображения' }))
                            } else axios.post(`/api/tests/${router.query.id}/questions/add`, { name: create.name, type: create.type, answers: create.type == 0 && answers, correct: create.correct }).then(({data}) => update(data))
                        }}>Создать</Button>
                    </ModalBody>
                </ModalContent>
            </Modal>}
            {edit && <Modal isOpen={edit.state} onClose={() => setEdit({ state: false })}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Редактирование вопроса</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {edit.image && <img style={{ marginBottom: 20 }} src={`/api/uploads/${edit.image}`} />}
                        <Input variant={'filled'} placeholder={'Вопрос'} value={edit.question} onChange={(e) => setEdit({...edit, question: e.target.value })} />
                        <Select variant={'filled'} my={3} placeholder={'Тип вопроса'} value={edit.type} onChange={(e) => setEdit({...edit, type: e.target.value })}>
                            <option value={0}>Тестовый вопрос (теория)</option>
                            <option value={1}>Письменный вопрос (практика)</option>
                        </Select>
                        {edit.type == 0 && <>
                            <SimpleGrid columns={3}>
                                <GridItem colSpan={2}>
                                    <Heading size={'md'} my={3}>Варианты ответов</Heading>
                                </GridItem>
                                <GridItem colSpan={1}>
                                    <NumberInput my={2} value={edit.answers.length || 0} min={1} max={10} onChange={(e) => {
                                        edit.answers.length = e;
                                        setEdit({...edit, answers: [...edit.answers] })
                                    }}>
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </GridItem>
                            </SimpleGrid>
                            {edit.answers.map((a, index) => (
                                <SimpleGrid columns={12}>
                                    <GridItem colSpan={11}>
                                        <Input my={1} placeholder={`Ответ #${index+1}`} value={a} onChange={(e) => {
                                            let arr = edit.answers;
                                            arr[index] = e.target.value;
                                            setEdit({...edit, answers: [...arr]})
                                        }} />
                                    </GridItem>
                                    <GridItem colSpan={1}>
                                        <Checkbox m={4} isChecked={edit.correct.includes(index)} onChange={(e) => {
                                            if(e.target.checked) setEdit({...edit, correct: [...edit.correct, index] })
                                            else setEdit({...edit, correct: [...edit.correct.filter(e => e != index)] })
                                        }} />
                                    </GridItem>
                                </SimpleGrid>
                            ))}
                        </>}
                        <Heading fontWeight={600} size={'sm'} mt={6} mb={2}>Изображение</Heading>
                        <IconButton disabled={edit.image} onClick={() => editFileUpload.current.click()} icon={<AiOutlinePaperClip />} variant={'ghost'} />
                        {edit.image && <IconButton onClick={() => setEdit({...edit, image: false})} icon={<AiOutlineClose />} colorScheme={'red'} />}
                        <input
                            type="file"
                            name="myImage"
                            id={'upload-photo'}
                            ref={editFileUpload}
                            style={{ opacity: 0, position: 'absolute', zIndex: '-1' }}
                            onChange={(event) => {
                                const form = new FormData();
                                form.append('image', event.target.files[0])
                                axios.post(`/api/image`, form).then(({data: d}) => {
                                    setEdit({...edit, image: d.url })
                                })
                            }}
                        />
                        <br/>
                        <Button my={3} colorScheme={'cyan'} onClick={() => {
                            if(edit.type == 0 && edit.answers.filter(e => !e).length > 0) return toast({ title: 'Заполните все варианты ответов', status: 'error' })
                            if(!edit.question) return toast({ title: 'Заполните все поля', status: 'error' });
                            axios.post(`/api/tests/${router.query.id}/questions/edit`, { questionId: edit.id, question: edit.question, type: edit.type, answers: edit.type == 0 ? edit.answers : [], correct: edit.correct || [], image: edit.image || null }).then(({data}) => {
                                setEdit({ state: false });
                                let arr = info.questions;
                                arr[arr.findIndex(e => e.id == edit.id)] = data;
                                setInfo({...info, questions: [...arr] })
                            })
                        }}>Сохранить</Button>
                    </ModalBody>
                </ModalContent>
            </Modal>}
        </>
    );
}