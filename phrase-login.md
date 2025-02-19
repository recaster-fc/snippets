
# How Recaster Implements Login with Recovery Phrases via Neynar


## Introduction

[Recaster](https://recaster.org/), another popular Farcaster client, has implemented a seamless login solution leveraging Neynar's API to enable users to access their Farcaster accounts using recovery phrases. 

This technical deep dive explores how Recaster integrates with Neynar to create a secure and user-friendly authentication flow.


## The Integration Architecture

Recaster's authentication system combines local cryptographic operations with Neynar's authentication API. Here's how it works:


### 1. Local Recovery Phrase Processing
```typescript
import { mnemonicToAccount } from "viem/accounts";

// Convert user's recovery phrase to an Ethereum account
const requestedUserAccount = mnemonicToAccount(phrase);
const address = requestedUserAccount.address;
```


### 2. Authentication Flow with Neynar


The core authentication process involves a series of interactions with Neynar's API:

```typescript
// 1. Request authentication nonce from Neynar
const nonceRes = await neynarApi.auth.fetchNonce();

// 2. Create SIWE message for authentication
const message = createSiweMessage({
    address: address,
    chainId: 1,
    domain: "recaster.org",
    nonce: nonceRes.nonce,
    uri: "https://recaster.org",
    version: "1",
    issuedAt: new Date(),
});

// 3. Sign the message with user's account
const signature = await requestedUserAccount.signMessage({
    message: message,
});

// 4. Verify signature and obtain signer uuid via Neynar
const signerRes = await neynarApi.auth.fetchSigners({
    message: message,
    signature,
});
```



## Neynar API Integration Details

### Key API Endpoints

1. **Nonce Generation**  [fetchNonce](https://docs.neynar.com/reference/fetch-nonce)
* Provides a unique challenge for each authentication attempt
* Prevents replay attacks
* Ensures request freshness


2. **Signature Verification**  [fetchSigners](https://docs.neynar.com/reference/fetch-signers)
* Validates the signed SIWE message
* Handles the complex protocol-level verification
* Returns Farcaster ID (FID), authentication status and signer uuid


## User Experience Flow

1. **Input Collection**
* User enters Farcaster recovery phrase
* Recaster validates phrase format
* Clear feedback during process

2. **Authentication Process**
* Convert phrase to account locally
* Obtain nonce from Neynar
* Create and sign authentication message
* Verify through Neynar API

3. **Session Management**
* Secure credential storage
* FID signer-uuid association



## Conclusion

Recaster's integration with Neynar's API demonstrates how modern Farcaster clients can implement secure and user-friendly authentication systems. By leveraging Neynar's specialized services, Recaster provides a robust login solution while maintaining focus on user experience and security.
This partnership showcases the power of specialized API services in simplifying complex protocol interactions, allowing client applications to deliver better features with reduced implementation complexity.
