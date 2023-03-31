import styled from "@emotion/styled";
import { Pagination, Avatar } from "antd";
import { StarFilled } from "@ant-design/icons";

export const StyledP = styled.p`
  font-size: 10px;
`;

export const StyledAvatar = styled(Avatar)<{ customColor: string }>`
  background-color: ${(props) => props.customColor};
`;

export const StyledStarFilled = styled(StarFilled)`
  color: #fff220;
`;

export const StyledTopBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(0, 0, 0, 0.45);
`;

export const StyledSpinContainer = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const StyledPagination = styled(Pagination)`
  margin: 10px 0;
  float: right;
`;
