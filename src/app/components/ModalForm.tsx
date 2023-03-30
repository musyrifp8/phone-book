import { Button, Col, Form, Input, Modal, Row, notification } from "antd";
import { Contact } from "../page";
import { CloseOutlined, PlusCircleOutlined } from "@ant-design/icons";
import client from "../graphql/apollo-client";
import { ADD_CONTACT } from "../graphql/query";

interface IModalFormProps {
  record?: Contact;
  visible: boolean;
    setModalData: (value: { record: Contact | null; isOpen: boolean }) => void;
    fetchData: () => void
}

export const ModalForm = ({
  record,
  visible,
    setModalData,
  fetchData
}: IModalFormProps) => {
  const [form] = Form.useForm();

  const onFinish = async (): Promise<any> => {
    try {
        const response = await form.validateFields();
      const { data } = await client.mutate({
        variables: {
          first_name: response.firstName,
          last_name: response.lastName,
          phones: [
            ...response.phones.map((item: {phone: string}) => ({
              number: item.phone,
            })),
          ],
        },
        mutation: ADD_CONTACT,
      });
        fetchData()
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
                onFinish()
              setModalData({
                record: null,
                isOpen: false,
              })
      }
      }
      onCancel={() =>
        setModalData({
          record: null,
          isOpen: false,
        })
      }
    >
      <Form form={form} initialValues={{ remember: true }} onFinish={onFinish}>
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "Please input your first name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.List name="phones" initialValue={[null]}>
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <>
                  <Row align="top">
                    <Col span={22}>
                      <Form.Item
                        label={`Nomor Telephone ${index + 1}`}
                        name={[index, "phone"]}
                        rules={[
                          {
                            required: index === 0,
                            message: "Please input your telephone number!",
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
                </>
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
