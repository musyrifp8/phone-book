import { EditOutlined, StarFilled, StarOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Contact } from "../page";
import { StyledContainer, StyledStarOutlined } from "./styled.ExpandRow";
import { StyledStarFilled } from "../styled.page";

interface IExpandedRowProps {
    record: Contact;
    onClickStar: () => void
    onDelete: () => void
    onEdit: () => void
  }

export const ExpandedRow = ({ record, onClickStar, onDelete, onEdit }: IExpandedRowProps) => {
    return (
      <StyledContainer>
        <UserDeleteOutlined onClick={onDelete} style={{ color: 'red' }} />
        <EditOutlined onClick={onEdit} style={{ color: 'blue' }} />
        {record.isFavorite ? (
          <StyledStarFilled
            onClick={onClickStar}
          />
        ) : (
          <StyledStarOutlined
            onClick={onClickStar}
          />
        )}
      </StyledContainer>
    );
  };