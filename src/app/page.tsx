'use client';

import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google'
import client from "./graphql/apollo-client";
import { GET_CONTACTS, GET_TOTAL_CONTACTS } from './graphql/query';
import { Table, Pagination } from 'antd';
import { ColumnsType } from 'antd/es/table';

// const inter = Inter({ subsets: ['latin'] })

interface Contact {
  created_at: string,
  first_name: string,
  id: 2452,
  last_name: string,
  phones: {
    number: number
  }[]
}



export default function Home() {

  // const data = await getData()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)

  const columns: ColumnsType<any> = [
    {
      dataIndex: 'first_name',
      key: 'first_name',
      render: (_, record: Contact) => {
        console.log(record)
        return record.first_name
      }
    }, {
      dataIndex: 'phones',
      key: 'phones',
      render: (_, record: Contact) => {
        console.log(record)
        return record.phones[0].number
      }
    }
  ]

  async function getData(limit: number, offset: number): Promise<{
    contacts: Contact[], totalData: number
  }> {
    const contacts = await client.query({
      variables: {
        limit,
        offset,
        // where: {
        //   first_name: { "_like": "%sd%" },
        //   last_name: { "_like": "%sd%" }
        // }
      },
      query: GET_CONTACTS,
      
    });

    const total = await client.query({
      query: GET_TOTAL_CONTACTS
    })
  
    return {contacts: contacts.data.contact, totalData: total.data.contact_aggregate.aggregate.count}
  }
  
  async function onPageChange(page: number): Promise<void> {
    console.log(page)
  }

  useEffect(() => {
    const init = async () => {
      const data = await getData(10, 0)
      setTotalData(data.totalData)
      setContacts(data.contacts)
    }
    init()
  }, [])
  
  // console.log(data)
  return (
    <main>
      {/* <ul>{contacts?.map(item => <li key={item.id}>{item.first_name}</li>)}</ul> */}
      <Table columns={columns} showHeader={false} pagination={false} dataSource={contacts || []} />
      <Pagination current={currentPage} total={totalData} onChange={(page) => onPageChange(page) } />
    </main>
  )
}
