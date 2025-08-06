import {
    HStack,
    Input,
    VStack,
    Heading,
    Button,
    IconButton,
    Tooltip,
    useDisclosure,
    FormControl,
    Skeleton,
    Text,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    useToast,
    ModalOverlay,
    Select,
    Box,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerCloseButton,
    DrawerBody,
    Checkbox,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    PopoverTrigger, Portal, PopoverContent, PopoverHeader, PopoverCloseButton, PopoverBody, Popover
} from "@chakra-ui/react";
import {AddIcon, ArrowBackIcon} from "@chakra-ui/icons";
import React from "react";
import User from '/components/User'
import TestsList from '/components/TestsList'
import Router from 'next/router'
import axios from 'axios'
import {Field, Form, Formik} from "formik";
import { HexColorPicker } from "react-colorful";
import {AiOutlineClose, AiOutlinePaperClip} from "react-icons/ai";
import {FaFolder, FaTrash} from "react-icons/fa";
import {BsTrash} from "react-icons/bs";
export default function Tests(props) {
    const toast = useToast()
    const [tests, setTests] = React.useState(false);
    const [groups, setGroups] = React.useState(false)
    const [access, setAccess] = React.useState(false)
    const [design, setDesign] = React.useState(false)
    const [move, setMove] = React.useState(false)
    const [folders, setFolders] = React.useState(false)
    const { isOpen: isOpenFolder, onToggle: onToggleFolder } = useDisclosure()
    const { isOpen, onToggle } = useDisclosure()
    const fileUpload = React.useRef()
    React.useEffect(() => {
        axios.get('api/tests').then(({data}) => {
            setTests(data)
        })
        axios.get('api/groups').then(({data}) => {
            setGroups(data)
        })
        axios.get('api/tests/groups').then(({data}) => {
            setFolders(data)
        })
    }, [])
    return (
        <>
            <main>
                <VStack spacing={4} justify={"center"} mt={10}>
                    <User {...props} />
                    <HStack my={5}>
                        <Tooltip label={"Вернуться"}>
                            <IconButton onClick={() => Router.push('/dashboard')} icon={<ArrowBackIcon />} />
                        </Tooltip>
                        <Button onClick={onToggle} leftIcon={<AddIcon />}>Новый тест</Button>
                        {props.user.permissions.includes('admin') && <Button onClick={onToggleFolder} leftIcon={<FaFolder />}>Новая группа</Button>}
                    </HStack>
                    <Heading my={5} fontWeight={600}>{props.user.permissions.includes('admin') ? 'Все тесты' : 'Мои тесты'}</Heading>
                    <Skeleton isLoaded={tests && folders}>
                        {folders && tests && <Accordion allowToggle allowMultiple style={{ width: 'max-content' }}>
                            {folders.map(folder => (
                                <AccordionItem bg={'gray.900'} mb={3} rounded={'lg'} style={{ border: 0 }}>
                                    <AccordionButton style={{ fontSize: '1.3rem' }}>
                                        <Box as="span" flex='1' textAlign='left' style={{ display: 'flex' }}>
                                            {folder.name}
                                            <Text ml={2} color={'gray.500'}>
                                                {tests.filter(e => e.group == folder.id).length}
                                            </Text>
                                        </Box>
                                        <AccordionIcon style={{ justifyContent: 'end' }} />
                                    </AccordionButton>
                                    <AccordionPanel pb={4}>
                                        <TestsList setDesign={setDesign} setMove={setMove} setTests={setTests} tests={tests} group={folder.id} user={props.user} setAccess={setAccess} type={'min'} />
                                        {props.user.permissions.includes('admin') && <Popover>
                                            {({ isOpen, onClose }) => (
                                                <>
                                                    <PopoverTrigger>
                                                        <Button isDisabled={isOpen} mt={6} colorScheme={'red'} leftIcon={<BsTrash />}>
                                                            Удалить группу
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <Portal>
                                                        <PopoverContent>
                                                            <PopoverHeader>Подтверждение</PopoverHeader>
                                                            <PopoverCloseButton />
                                                            <PopoverBody>
                                                                <Text>Вы уверены, что хотите удалить группу?</Text>
                                                                <Button colorScheme={'red'} mt={3} onClick={() => {
                                                                    axios.post(`/api/tests/groups/remove`, { id: folder.id }).then(({data}) => {
                                                                        setFolders([...folders.filter(e => e.id != folder.id)])
                                                                        onClose()
                                                                    })
                                                                }}>Удалить</Button>
                                                            </PopoverBody>
                                                        </PopoverContent>
                                                    </Portal>
                                                </>
                                            )}
                                        </Popover>}
                                    </AccordionPanel>
                                </AccordionItem>)
                            )}
                            {tests.filter(e => e.group == null).length > 0 && <AccordionItem bg={'gray.900'} mb={3} rounded={'lg'} style={{ border: 0 }}>
                                <AccordionButton style={{ fontSize: '1.3rem' }}>
                                    <Box as="span" flex='1' textAlign='left' style={{ display: 'flex' }}>
                                        Остальные тесты
                                        <Text ml={2} color={'gray.500'}>
                                            {tests.filter(e => e.group == null).length}
                                        </Text>
                                    </Box>
                                    <AccordionIcon style={{ justifyContent: 'end' }} />
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                    <TestsList setDesign={setDesign} setMove={setMove} setTests={setTests} tests={tests} group={null} user={props.user} setAccess={setAccess} type={'min'} />
                                </AccordionPanel>
                            </AccordionItem>}
                        </Accordion>}
                    </Skeleton>
                </VStack>
            </main>
            {access && <Drawer size={'full'} isOpen={access} onClose={() => setAccess(false)}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader>Редактирование доступа</DrawerHeader>
                    <DrawerCloseButton />
                    <DrawerBody>
                        <Select variant={'filled'} placeholder={'Тип доступа'} value={access.access.type} onChange={(e) => setAccess({...access, access: {...access.access, type: e.target.value } })}>
                            <option value={0}>Ручной доступ</option>
                            <option value={1}>Автоматический доступ</option>
                        </Select>
                        <Box>
                            <Heading fontWeight={600} size={'md'} my={5}>Группы, имеющие доступ к прохождению теста</Heading>
                            {groups.map(g => (<Button bg={access.access.groups?.includes(g.id) ? `green.400` : 'gray.600'} _hover={{ bg: access.access.groups?.includes(g.id) ? `#${g.color}` : 'gray.500' }} onClick={() => { setAccess({...access, access: {...access.access, groups: access.access.groups?.includes(g.id) ? [...access.access.groups.filter(d => d != g.id)] : [...access.access.groups, g.id] } }) }} value={g.id} size={'sm'} m={1}>{g.name}</Button>))}
                        </Box>
                        <br/>
                        <Button my={5} colorScheme={'cyan'} onClick={() => {
                            axios.post(`/api/tests/${access.id}/access`, {...access.access }).then(({data}) => {
                                let arr = tests;
                                arr[arr.findIndex(e => e.id == data.id)].access = access.access;
                                setTests([...arr])
                                setAccess(false);
                            })
                        }}>Сохранить</Button>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>}
            <Modal isOpen={isOpen} onClose={onToggle}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Создание теста</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Formik initialValues={{}} onSubmit={(e, { errors }) => {
                            if(e.time < 300) return toast({ status: 'warning', title: 'Введите как минимум 5 минут (300 секунд)' })
                            axios.post('/api/tests/new', e).then(({data}) => {
                                data.ownerName = props.user.name
                                setTests([...tests, data]);
                                onToggle()
                            })
                        }}>
                            {({ handleSubmit, errors, touched }) => (
                                <Form onSubmit={handleSubmit}>
                                    <FormControl id="email" mb={3} isInvalid={errors.name}>
                                        <Field as={Input} id="name" name="name" type="text" variant={'filled'} placeholder={'Название'} validate={(e) => { if(!e) return "Введите имя" }} />
                                    </FormControl>
                                    <FormControl id="email" mb={3} isInvalid={errors.time}>
                                        <Field as={Input} id="time" name="time" type="text" variant={'filled'} placeholder={'Время в секундах'} validate={(e) => { if(!e) return "Введите имя" }} />
                                    </FormControl>
                                    <Text my={2} color={'gray.400'}>Изначально тест будете видеть только вы.</Text>
                                    <Button colorScheme={'teal'} type={'submit'} mb={5}>Создать</Button>
                                </Form>
                            )}
                        </Formik>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenFolder} onClose={onToggleFolder}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Создание группы</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Formik initialValues={{}} onSubmit={(e, { errors }) => {
                            axios.post('/api/tests/groups/new', e).then(({data}) => {
                                setFolders([...folders, data]);
                                onToggleFolder()
                            })
                        }}>
                            {({ handleSubmit, errors, touched }) => (
                                <Form onSubmit={handleSubmit}>
                                    <FormControl id="email" mb={3} isInvalid={errors.name}>
                                        <Field as={Input} id="name" name="name" type="text" variant={'filled'} placeholder={'Название'} validate={(e) => { if(!e) return "Введите имя" }} />
                                    </FormControl>
                                    <Button colorScheme={'teal'} type={'submit'} mb={5}>Создать</Button>
                                </Form>
                            )}
                        </Formik>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={design} onClose={() => setDesign(false)}>
                <ModalOverlay />
                <ModalContent style={{ userSelect: 'none' }}>
                    <ModalHeader>Управление оформлением</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Heading fontWeight={600} size={'sm'} mt={6} mb={2}>Цветовое оформление</Heading>
                        <Checkbox mb={2} isChecked={design.color} onChange={(e) => setDesign({...design, color: e.target.checked ? '#000' : false })}>
                            Выбрать цвет
                        </Checkbox>
                        {design.color && <HexColorPicker color={design.color} onChange={(e) => setDesign({...design, color: e })} />}
                        <Heading fontWeight={600} size={'sm'} mt={6} mb={2}>Шапка</Heading>
                        <IconButton disabled={design.cover} onClick={() => fileUpload.current.click()} icon={<AiOutlinePaperClip />} variant={'ghost'} />
                        {design.cover && <IconButton onClick={() => setDesign({...design, cover: null })} icon={<AiOutlineClose />} colorScheme={'red'} />}
                        <input
                            type="file"
                            name="myImage"
                            id={'upload-photo'}
                            ref={fileUpload}
                            style={{ opacity: 0, position: 'absolute', zIndex: '-1' }}
                            onChange={(event) => {
                                const form = new FormData();
                                form.append('image', event.target.files[0])
                                axios.post(`/api/image`, form).then(({data: d}) => {
                                    setDesign({...design, cover: d.url })
                                }).catch(err => toast({ status: 'error', title: 'Ошибка при загрузке изображения' }))
                            }}
                        />
                        {design.cover && <img style={{ marginTop: 20 }} src={`/api/uploads/${design.cover}`} />}
                        <br/>
                        <Button my={4} onClick={() => {
                                axios.post(`/api/admin/tests/${design.id}/changeDesign`, { color: design.color, cover: design.cover }).then(({data}) => {
                                    setDesign(false)
                                })
                        }}>
                            Сохранить
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={move} onClose={() => setMove(false)}>
                <ModalOverlay />
                <ModalContent style={{ userSelect: 'none' }}>
                    <ModalHeader>Перемещение теста</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Select value={move.group} onChange={(e) => setMove({...move, group: e.target.value })}>
                            <option value={null}>Без группы</option>
                            {folders && folders.map(folder => (<option value={folder.id}>{folder.name}</option>))}
                        </Select>
                        <Button my={4} onClick={() => {
                            axios.post(`/api/admin/tests/${move.id}/move`, { group: move.group }).then(({data}) => {
                                setMove(false);
                                let arr = tests;
                                arr[arr.findIndex(e => e.id == data.id)].group = data.group;
                                setTests([...arr])
                            })
                        }}>
                            Сохранить
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}