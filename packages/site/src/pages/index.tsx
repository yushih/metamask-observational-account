import { KeyringSnapRpcClient } from '@metamask/keyring-api';
import React, { useContext, useEffect, useState } from 'react';

import { AccountList, Card, ConnectButton } from '../components';
import { Method } from '../components/Method';
import {
  Container,
  Divider,
  DividerTitle,
  StyledBox,
} from '../components/styledComponents';
import { defaultSnapOrigin } from '../config';
import { MetaMaskContext, MetamaskActions } from '../hooks';
import { InputType } from '../types';
import type { KeyringState } from '../utils';
import { connectSnap, getSnap } from '../utils';

const snapId = defaultSnapOrigin;

const initialState: KeyringState = {
  pendingRequests: [],
  accounts: [],
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [snapState, setSnapState] = useState<KeyringState>(initialState);
  const client = new KeyringSnapRpcClient(snapId, window.ethereum);

  const [newAccountAddress, setNewAccountAddress] = useState<string>('');

  useEffect(() => {
    /**
     * Return the current state of the snap.
     *
     * @returns The current state of the snap.
     */
    async function getState() {
      if (!state.installedSnap) {
        return;
      }
      const accounts = await client.listAccounts();
      const pendingRequests = await client.listRequests();

      setSnapState({
        accounts,
        pendingRequests,
      });
    }

    getState().catch((error) => console.error(error));
  }, [state.installedSnap]);

  const syncAccounts = async () => {
    const accounts = await client.listAccounts();
    setSnapState({
      ...snapState,
      accounts,
    });
  };

  const createAccount = async (options: { address: string }) => {
    const newAccount = await client.createAccount(options);
    await syncAccounts();
    return newAccount;
  };

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const createAccountMethod = {
    name: 'Create account',
    description: 'Create a new account',
    inputs: [
      {
        id: 'create-account-public-key',
        title: 'Public key',
        value: newAccountAddress,
        type: InputType.TextField,
        placeholder: 'E.g. 0x0000000000000000000000000000000000000000',
        onChange: (event: any) =>
          setNewAccountAddress(event.currentTarget.value),
      },
    ],
    action: {
      callback: async () =>
        await createAccount({ address: newAccountAddress.trim() }),
      label: 'Create Account',
      disabled: !/^0x[0-9a-fA-F]{40}$/u.test(newAccountAddress.trim()),
    },
    successMessage: 'Account created',
  };

  return (
    <Container>
      {!state.installedSnap && (
        <Card
          content={{
            title: 'Connect',
            description: 'Install on Metamask',
            button: (
              <ConnectButton
                onClick={handleConnectClick}
                disabled={!state.hasMetaMask}
              />
            ),
          }}
          disabled={!state.hasMetaMask}
        />
      )}

      <StyledBox>
        <Method {...createAccountMethod} />
        <Divider />
        <DividerTitle>Accounts</DividerTitle>
        <AccountList
          accounts={snapState.accounts}
          handleDelete={async (accountIdToDelete) => {
            await client.deleteAccount(accountIdToDelete);
            const accounts = await client.listAccounts();
            setSnapState({
              ...snapState,
              accounts,
            });
          }}
        />
      </StyledBox>
    </Container>
  );
};

export default Index;
