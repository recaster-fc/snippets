import React from "react";
import { View } from "react-native";
import WebView from "react-native-webview";
import * as SecureStore from "expo-secure-store";
import { useWebViewRpcAdapter } from "@farcaster/frame-host-react-native";
import { useNavigation } from "@react-navigation/native";
import { useWeb3Modal } from "@web3modal/wagmi-react-native";
import { WalletClient } from "viem";
import { useAccount } from "wagmi";

import { useAuth } from "~/hook/useAuth";
import {
  getAccountFromPhrase,
  getSignSinature,
} from "~/utils/farcaster-wallet";
import { openURLInBrowser } from "~/utils/url";

export default function FramesV2Webview({
  url,
  walletClient,
}: {
  url: string;
  walletClient?: WalletClient;
}) {
  const { user } = useAuth();
  const { address } = useAccount();
  const { open } = useWeb3Modal();
  const navigation = useNavigation();
  const webViewRef = React.useRef<WebView>(null);

  const { onMessage, emit } = useWebViewRpcAdapter({
    webViewRef,
    sdk: {
      context: {
        user: {
          fid: user.fid,
          username: user.username,
          displayName: user.displayName,
          pfpUrl: user.avatar,
        },
        client: {
          clientFid: 356900,
          added: false,
        },
      },
      close: () => {
        navigation.goBack();
      },
      ready: () => {},
      openUrl: (url) => {
        openURLInBrowser(url);
      },
      viewProfile: async ({ fid }) => {
        navigation.navigate("UserScreen", {
          id: { fid },
        });
      },
      signIn: async ({ nonce }) => {
        const phrase = await SecureStore.getItemAsync(user.fid.toString());
        if (phrase) {
          const { message, signature } = await getSignSinature({
            fid: user.fid,
            nonce,
            phrase,
            url,
          });
          return {
            message,
            signature,
          };
        } else {
          const res = (await Modal.show("PhraseLoginModal", {
            title: "Add recovery phrase to sign in",
            messageData: {
              nonce,
              url,
            },
          })) as {
            fid: number;
            phrase: string;
          };
          if (res) {
            const { message, signature } = await getSignSinature({
              fid: res.fid,
              nonce,
              phrase: res.phrase,
              url,
            });
            return {
              message,
              signature,
            };
          } else {
            throw new Error("User has no phrase");
          }
        }
      },
      setPrimaryButton: () => {},
      // @ts-ignore
      ethProviderRequest: async ({ method, params }) => {
        if (method === "eth_requestAccounts" || method === "eth_accounts") {
          if (address) {
            return [address];
          } else {
            open();
          }
        }
        if (!walletClient) {
          throw new Error("Wallet not connected");
        }
        return walletClient.transport.request({ method, params });
      },
      ethProviderRequestV2: walletClient?.transport,
    },
    debug: false,
  });

  return (
    <WebView
      ref={webViewRef}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      allowsFullscreenVideo={true}
      startInLoadingState={true}
      javaScriptEnabled={true}
      originWhitelist={["*"]}
      source={{
        uri: url,
      }}
      onMessage={onMessage}
      renderLoading={() => (
        <View
        >
          <LoadingIndicator />
        </View>
      )}
    />
  );
}
