'use client';

import { useMemo } from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { split } from '@apollo/client';
import { ThemeProvider } from "@/providers/theme-provider";
import dynamic from 'next/dynamic';
import { Toaster } from "react-hot-toast";
import { SWRConfig } from 'swr';
import { fetcher } from "@/lib/utils";
import { useAuthStore } from '@/store/authStore';

// Dynamically import Web3Provider with SSR disabled
const Web3Provider = dynamic(
  () => import('@/providers/web3-provider').then((mod) => ({ default: mod.Web3Provider })),
  {
    ssr: false,
    loading: () => <div>Loading Web3...</div>,
  }
);

function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();

  const headers = useMemo(() => {
    if (accessToken) {
      return {
        authorization: `Bearer ${accessToken}`,
      };
    }
    return {};
  }, [accessToken]);

  const client = useMemo(() => {
    const httpLink = createHttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
    });

    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          ...headers,
        }
      };
    });

    const wsLink = new GraphQLWsLink(createClient({
      url: process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT || 'ws://localhost:4000/graphql',
      connectionParams: () => ({
        authorization: accessToken ? `Bearer ${accessToken}` : "",
      }),
    }));

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      from([authLink, httpLink]),
    );

    return new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              helpRequests: {
                keyArgs: false,
                merge(existing = [], incoming) {
                  return [...existing, ...incoming];
                },
              },
              fundingRounds: {
                keyArgs: false,
                merge(existing = [], incoming) {
                  return [...existing, ...incoming];
                },
              },
              auctions: {
                keyArgs: false,
                merge(existing = [], incoming) {
                  return [...existing, ...incoming];
                },
              },
              proposals: {
                keyArgs: false,
                merge(existing = [], incoming) {
                  return [...existing, ...incoming];
                },
              },
            },
          },
          HelpRequest: {
            fields: {
              raised: {
                merge(existing, incoming) {
                  return incoming;
                },
              },
            },
          },
          FundingRound: {
            fields: {
              raised: {
                merge(existing, incoming) {
                  return incoming;
                },
              },
            },
          },
          Auction: {
            fields: {
              currentBid: {
                merge(existing, incoming) {
                  return incoming;
                },
              },
            },
          },
        },
      }),
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all',
        },
        query: {
          errorPolicy: 'all',
        },
      },
    });
  }, [accessToken]);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 30000,
        revalidateOnFocus: false,
        errorRetryCount: 3,
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Web3Provider>
          <ApolloWrapper>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: "glass dark:glass-dark",
                style: {
                  background: 'transparent',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                },
              }}
            />
          </ApolloWrapper>
        </Web3Provider>
      </ThemeProvider>
    </SWRConfig>
  );
} 