import type { FunctionComponent, ReactNode } from 'react';
import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';

import { Footer, Header, AlertBanner, AlertType } from './components';
import { GlobalStyle } from './config/theme';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  max-width: 100vw;
`;

const BannerWrapper = styled.div`
  padding-top: 25px;
  padding-left: 5%;
  padding-right: 5%;
`;

export type AppProps = {
  children: ReactNode;
};

export const App: FunctionComponent<AppProps> = ({ children }) => {
  // Make sure we are on a browser, otherwise we can't use window.ethereum.
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Observational wallet</title>
      </Helmet>
      <GlobalStyle />
      <Wrapper>
        <BannerWrapper>
          <AlertBanner
            title={
              "These are observational accounts. Do not send any asset to these accounts. Assets sent here becomes either locked or somebody else's!"
            }
            alertType={AlertType.Failure}
          />
        </BannerWrapper>
        <Header />
        {children}
        <Footer />
      </Wrapper>
    </>
  );
};
