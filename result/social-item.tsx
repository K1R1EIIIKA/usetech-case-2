import styled from 'styled-components';

export const StyledSocialText = styled.p`
    font-family: "Gilroy", sans-serif;
    font-weight: 500;
    font-size: 16px;
    text-align: left;
    line-height: 20px;
    color: #ffffff;
    white-space: nowrap; // To prevent text from wrapping if it overflows the container
    // Note: We cannot directly set the "textOverflow" property here because it is not supported in CSS for multiline text.
`;
