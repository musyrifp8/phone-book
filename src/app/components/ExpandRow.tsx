import { EditOutlined, StarFilled, StarOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Contact } from "../page";

interface IExpandedRowProps {
    record: Contact;
    onClickStar: () => void
    onDelete: () => void
    // onEdit: () => void
  }

export const ExpandedRow = ({ record, onClickStar, onDelete }: IExpandedRowProps) => {
    return (
      <div style={{ display: "flex", justifyContent: "space-evenly", gap: '10px' }}>
        <UserDeleteOutlined onClick={onDelete} style={{ color: 'red' }} />
        <EditOutlined style={{ color: 'blue' }} />
        {record.isFavorite ? (
          <StarFilled
            onClick={onClickStar}
            style={{
              color: "#fff220",
            }}
          />
        ) : (
          <StarOutlined
            onClick={onClickStar}
            style={{
              color: "#fff220",
            }}
          />
        )}
      </div>
    );
  };