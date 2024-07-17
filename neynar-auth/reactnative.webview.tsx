import * as React from "react";
import { TouchableOpacity, View } from "react-native";
import WebView from "react-native-webview";



function WebLoginModal({
  onClose,
  handleSignin,
}: {
  onClose: () => void;
  handleSignin: (data: any) => void;
}) {
  const injectedJavaScript = `
    (function() {
        var originalPostMessage = window.postMessage;
        window.postMessage = function(message, targetOrigin, transfer) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
            } else {
                originalPostMessage.call(this, message, targetOrigin, transfer);
            }
        };

        if (!window.opener) {
            window.opener = {
                postMessage: window.postMessage
            };
        }
    })();
    true;
`;
  return (
    <WebView
        injectedJavaScript={injectedJavaScript}
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        startInLoadingState={true}
        javaScriptEnabled={true}
        originWhitelist={["*"]}
        source={{
        uri: `your nextjs page url`,
        }}
        onMessage={(event) => {
        const parsedData = JSON.parse(event.nativeEvent.data);
        // console.log(parsedData); 
        // {
        //     "is_authenticated": true,
        //     "signer_uuid": "xxxxx",
        //     "fid": "3346",
        //     "user": {
        //         "object": "user",
        //         "fid": 3346,
        //         "custody_address": "xxxx",
        //         "username": "xxx",
        //         "display_name": "xxx",
        //         "pfp_url": "xxx",
        //         "profile": {
        //             "bio": {
        //                 "text": "xxx"
        //             }
        //         },
        //         "follower_count": 1,
        //         "following_count": 2,
        //         "verifications": [""],
        //         "verified_addresses": {
        //             "eth_addresses": [],
        //             "sol_addresses": []
        //         },
        //         "active_status": "inactive",
        //         "power_badge": true
        //     }
        // }
        handleSignin(parsedData);
        onClose();
        }}
    />
  );
}

