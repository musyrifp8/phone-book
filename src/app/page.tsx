"use client";

import { useEffect, useState } from "react";
import client from "./graphql/apollo-client";
import {
  GET_CONTACTS,
  GET_TOTAL_CONTACTS,
  DELETE_CONTACT,
} from "./graphql/query";
import { Table, Pagination, Spin, Input, Avatar, notification } from "antd";
import { ColumnsType } from "antd/es/table";
import useLocalStorage, { ILocalStorageItems } from "./hook/useLocalStorage";
import { StarFilled, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { ExpandedRow } from "./components/ExpandRow";
import { ModalForm } from "./components/ModalForm";

const {
  CONTACTS,
  CURRENT_PAGE,
  TOTAL_DATA,
  FILTER,
  PINNED,
  SELECTED_CONTACTS,
} = ILocalStorageItems;

export interface Contact {
  created_at: string;
  first_name: string;
  id: 2452;
  last_name: string;
  phones: {
    number: string;
  }[];

  //frontend only
  isFavorite: boolean;
  color: string;
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
  const [filter, setFilter] = useLocalStorage<string>(FILTER, "");
  const [selectedContacts, setSelectedContacts] = useLocalStorage<Contact[]>(
    SELECTED_CONTACTS,
    []
  );
  const [pinned, setPinned] = useLocalStorage<Contact[]>(PINNED, []);
  const [modalData, setModalData] = useState<{
    record: Contact | null;
    isOpen: boolean;
  }>({
    record: null,
    isOpen: false,
  });

  const columns: ColumnsType<any> = [
    {
      key: "avatar",
      render: (_, record: Contact) => {
        return (
          <Avatar
            size={"default"}
            style={{ backgroundColor: record.color }}
            icon={<UserOutlined />}
          />
        );
      },
    },
    {
      dataIndex: "name",
      key: "name",
      render: (_, record: Contact) => {
        const name = `${record.first_name} ${record.last_name}`;
        return (
          <div>
            <p>
              <b>{name}</b>
            </p>
            <p style={{ fontSize: "10px" }}>{record.phones[0].number}</p>
          </div>
        );
      },
    },
    {
      dataIndex: "isFavorite",
      key: "isFavorite",
      width: "10%",
      render: (_, record: Contact) => {
        return (
          record.isFavorite && (
            <StarFilled
              style={{
                color: "#fff220",
              }}
            />
          )
        );
      },
    },
  ];

  async function getData(): Promise<{
    contacts: Contact[];
    totalData: number;
  }> {
    const contacts = await client.query({
      fetchPolicy: "no-cache",
      variables: {
        where: {
          _or: [
            { first_name: { _like: `%${filter}%` } },
            { last_name: { _like: `%${filter}%` } },
          ],
        },
      },
      query: GET_CONTACTS,
    });

    const total = await client.query({
      fetchPolicy: "no-cache",
      variables: {
        where: {
          _or: [
            { first_name: { _like: `%${filter}%` } },
            { last_name: { _like: `%${filter}%` } },
          ],
        },
      },
      query: GET_TOTAL_CONTACTS,
    });

    return {
      contacts: contacts.data.contact,
      totalData: total.data.contact_aggregate.aggregate.count,
    };
  }

  async function onPageChange(page: number): Promise<void> {
    let tempOffset = page * 10 - 10;
    setPagination({ currentPage: page, offset: tempOffset });
  }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getData();
      if (!!!contacts.length) {
        const tempContact = data.contacts.map((item) => ({
          ...item,
          isFavorite: false,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        }));
        setContacts(tempContact);
        setSelectedContacts(tempContact);
        setTotalData(tempContact.length);
      } else {
        let tempContact = [...pinned];
        let tempSelected: Contact[] = [];

        data.contacts.forEach((item) => {
          const isPinned = pinned.find((pinned) => pinned.id === item.id);
          if (!isPinned) {
            tempSelected.push({
              ...item,
              isFavorite: false,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            });
            tempContact = [...tempSelected];
          }
        });

        setContacts([...tempContact]);
        setSelectedContacts([...tempSelected]);
        setTotalData(tempSelected.length);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  function onClickStar(record: Contact): void {
    let tempSelected = selectedContacts;
    let tempPinned = pinned;
    if (!record.isFavorite) {
      tempPinned.push({
        ...record,
        isFavorite: !record.isFavorite,
      });
      setPinned([...tempPinned]);
      tempSelected = [...tempSelected.filter((item) => item.id !== record.id)];
      setSelectedContacts(tempSelected);
    } else {
      tempSelected.push({
        ...record,
        isFavorite: !record.isFavorite,
      });
      setSelectedContacts([...tempSelected]);
      setPinned([...pinned.filter((item) => item.id !== record.id)]);
    }
    const tempContacts = contacts.map((item) => ({
      ...item,
      isFavorite: item.id === record.id ? !record.isFavorite : item.isFavorite,
    }));

    setContacts([...tempContacts]);
    setTotalData(tempSelected.length);
  }

  async function onDelete(record: Contact): Promise<void> {
    const { data } = await client.mutate({
      variables: {
        id: record.id,
      },

      mutation: DELETE_CONTACT,
    });

    if (data.delete_contact_by_pk) {
      notification.success({
        message: "Berhasil Menghapus Kontak",
      });
      fetchData();
    }
  }

  return (
    <div style={{ padding: "10px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "rgba(0, 0, 0, 0.45)",
        }}
      >
        <Input.Search
          placeholder="Search by name"
          value={filter}
          onChange={(e) => {
            setPagination({ currentPage: 1, offset: 0 });
            setFilter(e.target.value);
          }}
          loading={isLoading}
        />

        <UserAddOutlined
          onClick={() => setModalData({ record: null, isOpen: true })}
        />
      </div>
      {isLoading ? (
        <div>
          <Spin spinning={isLoading} />
        </div>
      ) : (
        <div>
          {!!pinned.length && pagination.currentPage === 1 && (
            <Table
              rowKey={(record) => record.id}
              columns={columns}
              showHeader={false}
              pagination={false}
              dataSource={pinned}
              expandable={{
                expandedRowRender: (record: Contact) => (
                  <ExpandedRow
                    record={record}
                    onClickStar={() => onClickStar(record)}
                    key={record.id}
                    onDelete={() => onDelete(record)}
                    onEdit={() =>
                      setModalData({
                        record: record,
                        isOpen: true,
                      })
                    }
                  />
                ),
                rowExpandable: (record) => !!record,
                expandIcon: () => null,
                expandIconColumnIndex: -1,
                expandRowByClick: true,
              }}
            />
          )}

          <Table
            rowKey={(record) => record.id}
            columns={columns}
            showHeader={false}
            pagination={false}
            dataSource={selectedContacts.slice(
              pagination.offset,
              10 + pagination.offset
            )}
            expandable={{
              expandedRowRender: (record: Contact) => (
                <ExpandedRow
                  record={record}
                  onClickStar={() => onClickStar(record)}
                  key={record.id}
                  onDelete={() => onDelete(record)}
                  onEdit={() =>
                    setModalData({
                      record: record,
                      isOpen: true,
                    })
                  }
                />
              ),
              rowExpandable: (record) => !!record,
              expandIcon: () => null,
              expandIconColumnIndex: -1,
              expandRowByClick: true,
            }}
          />

          <Pagination
            current={pagination.currentPage}
            total={totalData}
            onChange={(page) => onPageChange(page)}
            style={{ margin: "10px 0px", float: "right" }}
          />

          <ModalForm
            visible={modalData.isOpen}
            record={modalData.record}
            setModalData={setModalData}
            fetchData={fetchData}
          />
        </div>
      )}
    </div>
  );
}
