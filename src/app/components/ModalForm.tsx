import { useEffect } from "react";
import { Button, Col, Form, Input, Modal, Row, notification } from "antd";
import { Contact } from "../page";
import { CloseOutlined, PlusCircleOutlined } from "@ant-design/icons";
import client from "../graphql/apollo-client";
import {
  ADD_CONTACT,
  EDIT_CONTACT,
  GET_TOTAL_CONTACTS,
} from "../graphql/query";
import { RuleObject } from "antd/es/form";

interface IModalFormProps {
  record: Contact | null;
  visible: boolean;
  setModalData: (value: { record: Contact | null; isOpen: boolean }) => void;
  fetchData: () => void;
}

export const ModalForm = ({
  record,
  visible,
  setModalData,
  fetchData,
}: IModalFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        firstName: record.first_name,
        lastName: record.last_name,
        phones: record.phones.map((item) => ({ phone: item.number })),
      });
    }
  }, [record])

  const validateNumber = (_: RuleObject, value: string): Promise<void> => {
    const regex = /^[0-9]*$/;
    if (!regex.test(value)) {
      return Promise.reject('Please enter only numbers');
    }
    return Promise.resolve();
  };

  const validateInputName = (_: RuleObject, value: string): Promise<void> => {
    const regex = /^[a-zA-Z0-9]*$/;
    if (!regex.test(value)) {
      return Promise.reject('Please enter only letters and numbers');
    }
    return Promise.resolve();
  };

  const onFinish = async (): Promise<any> => {
    try {
      const response = await form.validateFields();

      const payload = {
        first_name: response.firstName,
        last_name: response.lastName,
        phones: [
          ...response.phones.map((item: { phone: string }) => ({
            number: item.phone,
          })),
        ],
      };

      let variables;

      if (record) {
        variables = {
          id: record.id,
          _set: {
            first_name: payload.first_name,
            last_name: payload.last_name,
          },
        };
      } else {
        variables = payload;
      }

      const total = await client.query({
        fetchPolicy: "no-cache",
        variables: {
          where: {
            _and: [
              { first_name: { _like: `%${payload.first_name}%` } },
              { last_name: { _like: `%${payload.last_name}%` } },
            ],
          },
        },
        query: GET_TOTAL_CONTACTS,
      });

      if (!!total.data.contact_aggregate.aggregate.count) {
        notification.error({
          message: "Nama yang anda pilih sudah digunakan",
        });
      } else {
        const { data } = await client.mutate({
          variables,
          mutation: record ? EDIT_CONTACT : ADD_CONTACT,
        });
        setModalData({
          record: null,
          isOpen: false,
        });
        fetchData();
      }
    } catch (err: any) {
      console.log(err);
      notification.error({
        message: "Terjadi kesalahan pada penginputan data",
      });
    }
  };

  return (
    <Modal
      title={record ? "Edit Contact" : "Add Contact"}
      open={visible}
      onOk={() => {
        onFinish();
      }}
      okText={'Simpan'}
      onCancel={() => {
        form.resetFields()
        setModalData({
          record: null,
          isOpen: false,
        })
      }
      }
    >
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "Please input your first name!" }, {
            validator: validateInputName,
          },]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Please input your last name!" }, {
            validator: validateInputName,
          },]}
        >
          <Input />
        </Form.Item>

        <Form.List name="phones" initialValue={[null]}>
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                  <Row key={index} align="top">
                    <Col span={22}>
                      <Form.Item
                        label={`Nomor Telephone ${index + 1}`}
                        name={[index, "phone"]}
                        rules={[
                          {
                            required: index === 0,
                            message: "Please input your telephone number!",
                          },
                          {
                            validator: validateNumber,
                          },
                        ]}
                      >
                        <Input placeholder="Masukkan Nomor Telepohone"></Input>
                      </Form.Item>
                    </Col>
                    {index !== 0 && (
                      <Col span={2}>
                        <Button
                          onClick={() => remove(field.name)}
                          type={"text"}
                          icon={<CloseOutlined />}
                          size={"middle"}
                        />
                      </Col>
                    )}
                  </Row>
              ))}

              <Row>
                <Col>
                  <Button
                    onClick={() => add()}
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    size={"middle"}
                  >
                    Tambah Nomor
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};
