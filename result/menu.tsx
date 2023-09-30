import styled from 'styled-components';

export const Menu = styled.div`
  width: 490px;
  height: 20px;
  position: relative;
  background-color: rgba(0, 0, 0, 0);
  display: flex;  // layoutMode is HORIZONTAL
  flex-wrap: nowrap; // layoutWrap is NO_WRAP
  gap: 24px; // itemSpacing is 24
  justify-content: flex-start;  // layoutAlign is INHERIT by default
  align-items: center;  // layoutAlign is INHERIT by default
`;
