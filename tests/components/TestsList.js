import {
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Tooltip,
    Badge,
    IconButton,
    HStack,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow, Text,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody, useDisclosure,
    NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Button, Portal
} from "@chakra-ui/react";
import { CgFileDocument, CgClose } from 'react-icons/cg'
import { BsShieldFillCheck, BsCheck2, BsTrash } from 'react-icons/bs'
import { FiLock } from 'react-icons/fi'
import React from "react";
import Router from 'next/router'
import axios from 'axios'
import {IoMdColorPalette} from "react-icons/io";
import {BiRepost} from "react-icons/bi";

export default function TestsList({ tests, setTests, type, user, setAccess, setDesign, setMove, group }) {
    const [edit, setEdit] = React.useState(false)
    const { onOpen, onClose, isOpen } = useDisclosure()
    const NewTime = React.useRef()
    return (
        <TableContainer>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th>Название</Th>
                        <Th>Статус</Th>
                        {user.permissions.includes('admin') && <Th>Владелец</Th>}
                        <Th>Время прохождения</Th>
                        <Th>Действия</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {tests && tests.filter(e => e.group == group).map(test => {
                        return (<Tr>
                            <Td>{test.name}</Td>
                            <Td>
                                <Badge colorScheme={test.status == 0 ? 'yellow' : test.status == 1 ? 'green' : test.status == 3 && 'gray'}>{test.status == 0 ? 'На рассмотрении' : test.status == 1 ? 'Активен' : test.status == 3 && 'Черновик'}</Badge>
                            </Td>
                            {user.permissions.includes('admin') && <Td>
                                {test.ownerName && test.ownerName}
                            </Td>}
                            <Td>
                                <Popover isOpen={edit == test.id} onOpen={() => setEdit(test.id)} onClose={() => setEdit(false)}>
                                    <PopoverTrigger>
                                        <Badge colorScheme={'cyan'}>{test.time} секунд ({test.time/60} минут)</Badge>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader>Изменение времени прохождения</PopoverHeader>
                                        <PopoverBody>
                                            <NumberInput min={300} max={7200} defaultValue={test.time}>
                                                <NumberInputField ref={NewTime} />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                            <Button mt={4} colorScheme={'cyan'} variant={'outline'} onClick={() => {
                                                axios.post(`/api/tests/${test.id}/time`, { time: NewTime.current.value }).then(({data}) => {
                                                    let arr = tests;
                                                    arr[arr.findIndex(e => e.id == test.id)].time = NewTime.current.value;
                                                    setTests([...arr])
                                                    setEdit(false)
                                                })
                                            }}>Сохранить</Button>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                            </Td>
                            <Td>
                                <HStack>
                                    {test.status == 0 && user.permissions.includes('admin') && <>
                                        <Tooltip label={"Одобрить тест"}>
                                            <IconButton icon={<BsCheck2 />} colorScheme={'green'} onClick={() => {
                                                axios.post(`/api/admin/tests/${test.id}/approve`).then(({data}) => {
                                                    let arr = tests;
                                                    arr[arr.findIndex(e => e.id == test.id)].status = 1;
                                                    setTests([...arr])
                                                })
                                            }} />
                                        </Tooltip>
                                        <Tooltip label={"Отклонить тест"}>
                                            <IconButton icon={<CgClose />} colorScheme={'red'} onClick={() => {
                                                axios.post(`/api/admin/tests/${test.id}/decline`).then(({data}) => {
                                                    if(user.id != data.owner) setTests([...tests.filter(e => e.id != data.id)])
                                                    else {
                                                        let arr = tests;
                                                        arr[arr.findIndex(e => e.id == test.id)].status = 3;
                                                        setTests([...arr])
                                                    }
                                                })
                                            }} />
                                        </Tooltip>
                                    </>}
                                    {test.status == 3 && <Tooltip label={"Отправить тест на одобрение"}>
                                        <IconButton icon={<BsShieldFillCheck />} onClick={() => {
                                            axios.post(`/api/tests/${test.id}/sendApprove`).then(({data}) => {
                                                let arr = tests;
                                                arr[arr.findIndex(e => e.id == test.id)].status = data.status;
                                                setTests([...arr])
                                            })
                                        }} />
                                    </Tooltip>}
                                    <Tooltip label={"Управление вопросами"}>
                                        <IconButton onClick={() => Router.push(`/tests/${test.id}/questions`)} icon={<CgFileDocument />} />
                                    </Tooltip>
                                    {user.permissions.length > 0 && <Tooltip label={"Управление доступом"}>
                                        <IconButton icon={<FiLock />} onClick={() => setAccess({...test, access: {...test.access, groups: !test.access.groups ? [] : test.access.groups } })} />
                                    </Tooltip>}
                                    {user.permissions.includes('admin') && <Tooltip label={"Переместить тест"}>
                                        <IconButton icon={<BiRepost />} onClick={() => setMove(test)} />
                                    </Tooltip>}
                                    {user.permissions.includes('admin') && <Tooltip label={"Управление оформлением"}>
                                        <IconButton icon={<IoMdColorPalette />} onClick={() => setDesign(test)} />
                                    </Tooltip>}
                                    {test.status == 3 && <Popover>
                                        {({ isOpen, onClose }) => (
                                            <>
                                                <PopoverTrigger>
                                                    <IconButton isDisabled={isOpen} colorScheme ={'red'} icon={<BsTrash />} />
                                                </PopoverTrigger>
                                                <Portal>
                                                    <PopoverContent>
                                                        <PopoverHeader>Подтверждение</PopoverHeader>
                                                        <PopoverCloseButton />
                                                        <PopoverBody>
                                                            <Text>Вы уверены, что хотите удалить черновик?</Text>
                                                            <Button colorScheme={'red'} mt={3} onClick={() => {
                                                                axios.post(`/api/tests/${test.id}/delete`).then(({data}) => {
                                                                    setTests([...tests.filter(e => e.id != test.id)])
                                                                    onClose()
                                                                })
                                                            }}>Удалить</Button>
                                                        </PopoverBody>
                                                    </PopoverContent>
                                                </Portal>
                                              </>
                                            )}
                                    </Popover>}
                                    {user.permissions.includes('admin') && test.status == 1 && <Popover>
                                        {({ isOpen, onClose }) => (
                                                <>
                                                    <PopoverTrigger>
                                                        <IconButton isDisabled={isOpen} colorScheme ={'red'} icon={<BsTrash />} />
                                                    </PopoverTrigger>
                                                    <Portal>
                                                        <PopoverContent>
                                                            <PopoverHeader>Подтверждение</PopoverHeader>
                                                            <PopoverCloseButton />
                                                            <PopoverBody>
                                                                <Text>Вы уверены, что хотите удалить активный тест?</Text>
                                                                <HStack mt={3}>
                                                                    <Button onClick={() => {
                                                                        axios.post(`/api/admin/tests/${test.id}/remove`).then(({data}) => {
                                                                            if(user.id != data.owner) setTests([...tests.filter(e => e.id != data.id)])
                                                                            else {
                                                                                let arr = tests;
                                                                                arr[arr.findIndex(e => e.id == test.id)].status = 3;
                                                                                setTests([...arr])
                                                                            }
                                                                            onClose()
                                                                        })
                                                                    }}>Отправить в черновик</Button>
                                                                    <Button colorScheme={'red'} onClick={() => {
                                                                        axios.post(`/api/tests/${test.id}/delete`).then(({data}) => {
                                                                            setTests([...tests.filter(e => e.id != test.id)])
                                                                            onClose()
                                                                        })
                                                                    }}>Удалить</Button>
                                                                </HStack>
                                                            </PopoverBody>
                                                        </PopoverContent>
                                                    </Portal>
                                                    </>
                                          )}
                                    </Popover>}
                                </HStack>
                            </Td>
                        </Tr>)
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    );
}
