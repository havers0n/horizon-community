import {
    HStack,
    Text,
    VStack,
    Heading,
    Button,
    IconButton,
    Tooltip,
    Input,
    Table,
    Skeleton,
    Thead, Tr, Th, Tbody, Td, Badge, Tfoot, TableContainer
} from "@chakra-ui/react";
import {InfoOutlineIcon, ArrowBackIcon, EditIcon} from "@chakra-ui/icons";
import React from "react";
import Link from 'next/link'
import User from '/components/User'
import Router from 'next/router'
import axios from 'axios'
import moment from 'moment'
import { BsTrash } from 'react-icons/bs'
export default function Results(props) {
    const [info, setInfo] = React.useState(false);
    const [filter, setFilter] = React.useState('')
    const [filtered, setFiltered] = React.useState(false)
    React.useEffect(() => {
        axios.get(`/api/admin/results/`).then(({data}) => {
            setInfo(data)
            setFiltered(data)
        })
    }, [])
    React.useEffect(() => {
        if(!info) return;
        let arr = info;
        if(filter != '') arr = arr.filter(function(e, i, a) {
            return e.name.search(filter) != -1 || e.testInfo.name.search(filter) != -1 || moment.unix(e.start).format('DD MMMM YYYY').search(filter) != -1;
        })
        setFiltered([...arr])
    }, [filter, info])
    return (
        <>
            <main>
                <VStack spacing={2} justify={"center"} style={{paddingTop: 15}}>
                    <User {...props} />
                    <Heading size={"md"} style={{color: "#ccc"}}>Результаты тестов</Heading>
                    <HStack mb={5}>
                        <Tooltip label={"Вернуться"}>
                            <Link href={'/'}><IconButton icon={<ArrowBackIcon />} /></Link>
                        </Tooltip>
                        <Input
                            width={290}
                            placeholder='Поиск по названию / имени / дате'
                            _placeholder={{ color: 'inherit' }}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </HStack>
                    <Skeleton isLoaded={info}>
                        <TableContainer>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th>Имя</Th>
                                        <Th>Тест</Th>
                                        <Th>Статус</Th>
                                        <Th>Время старта</Th>
                                        <Th>Итоговый результат</Th>
                                        <Th>Действия</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                        {filtered && filtered.map(i => (<Tr>
                                            <Td>{i.name}</Td>
                                            <Td>{i.testInfo.name}</Td>
                                            <Td>
                                                <Badge colorScheme={i.status == 2 ? 'yellow' : i.status == 3 ? 'green' : i.status == 4 ? 'red' : 'gray'}>{i.status == 2 ? 'Ожидает рассмотрения' : i.status == 3 ? 'Пройден' : i.status == 4 ? 'Не пройден' : 'Обнулен'}</Badge>
                                            </Td>
                                            <Td>
                                                {moment.unix(i.start).format('lll')}
                                            </Td>
                                            <Td>
                                                {Math.round(i.answers.filter(e => e.correct == 1).length/i.answers.length*100)}%
                                            </Td>
                                            <Td>
                                                <Tooltip label={"Подробнее"}>
                                                    <IconButton onClick={() => Router.push(`/results/${i.id}`)} icon={<InfoOutlineIcon />} />
                                                </Tooltip>
                                                {props.user.permissions.includes('admin') && <Tooltip label={"Удалить результат"}>
                                                    <IconButton onClick={() => {
                                                        axios.post(`/api/admin/results/${i.id}/delete`).then(({data}) => {
                                                            setInfo([...info.filter(e => e.id != i.id)]);
                                                        })
                                                    }} icon={<BsTrash />} colorScheme={'red'} ml={2} />
                                                </Tooltip>}
                                            </Td>
                                        </Tr>))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Skeleton>
                </VStack>
            </main>
        </>
    );
}