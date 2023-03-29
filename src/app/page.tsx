"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import client from "./graphql/apollo-client";
import { GET_CONTACTS, GET_TOTAL_CONTACTS } from "./graphql/query";
import { Table, Pagination, Spin, Input } from "antd";
import { ColumnsType } from "antd/es/table";
import useLocalStorage, { ILocalStorageItems } from "./hook/useLocalStorage";

const { CONTACTS, CURRENT_PAGE, TOTAL_DATA, FILTER } = ILocalStorageItems;

// const inter = Inter({ subsets: ['latin'] })

interface Contact {
  created_at: string;
  first_name: string;
  id: 2452;
  last_name: string;
  phones: {
    number: number;
  }[];
}

interface IPagination {
  currentPage: number;
  offset: number;
}

export default function Home() {

  const [contacts, setContacts] = useLocalStorage<Contact[]>(CONTACTS, []);
  const [pagination, setPagination] = useLocalStorage<IPagination>(
    CURRENT_PAGE,
    { currentPage: 1, offset: 0 }
  );
  const [totalData, setTotalData] = useLocalStorage<number>(TOTAL_DATA, 0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useLocalStorage<string>(FILTER, '')

  const columns: ColumnsType<any> = [
    {
      dataIndex: "name",
      key: "name",
      render: (_, record: Contact) => {
        const name = `${record.first_name} ${record.last_name}`
        return `${name.length - 15 <= 0 ? `${name}` : `${name.substring(0,15)}...`}`;
      },
    },
    {
      dataIndex: "phones",
      key: "phones",
      render: (_, record: Contact) => {
        return record.phones[0].number;
      },
    },
  ];

  async function getData(
    limit: number,
    offset: number
  ): Promise<{
    contacts: Contact[];
    totalData: number;
  }> {
    const contacts = await client.query({
      variables: {
        limit,
        offset,
        where: {
          _or: [
          
            {first_name: { "_like": `%${filter}%` }},
            {last_name: { "_like": `%${filter}%` }}
        ]
        }
      },
      query: GET_CONTACTS,
    });

    const total = await client.query({
      variables: {
        where: {
          _or: [
          
            {first_name: { "_like": `%${filter}%` }},
            {last_name: { "_like": `%${filter}%` }}
        ]
        }
      },
      query: GET_TOTAL_CONTACTS,
    });

    return {
      contacts: contacts.data.contact,
      totalData: total.data.contact_aggregate.aggregate.count,
    };
  }

  async function onPageChange(page: number): Promise<void> {
    let tempOffset = pagination.offset
    if (pagination.currentPage > page) {
      tempOffset = tempOffset - 10
    } else {
      tempOffset = tempOffset + 10
    }
    setPagination({ currentPage: page, offset: tempOffset });
  }


  useEffect(() => {
    const init = async () => {
        try {
          const data = await getData(10, pagination.offset);
          setContacts(data.contacts);
          setTotalData(data.totalData);
        } catch (error) {
          console.log(error);
        }
      
      setTimeout(() => setIsLoading(false), 3000)
    };

    init();
  }, [pagination, filter]);

  return (
    <div>
      <Input.Search placeholder="Search by name" value={filter} onChange={e => setFilter(e.target.value)} loading={isLoading} />
      {isLoading ? (
        <div>
          <Spin spinning={isLoading} />
        </div>
      ) : (
        <div>
          <Table
            columns={columns}
            showHeader={false}
            pagination={false}
            dataSource={contacts || []}
          />

          <Pagination
            current={pagination.currentPage}
            total={totalData}
            onChange={(page) => onPageChange(page)}
          />
        </div>
      )}
    </div>
  )
}
