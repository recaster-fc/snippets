export async function clearUsername({ phrase }: { phrase: string }) {
  const account = mnemonicToAccount(phrase);
  const addresss = account.address;
  const userData = await axios.get<{
    user: {
      fid: number;
      username: string;
    };
  }>(
    `https://api.neynar.com/v2/farcaster/user/custody-address?custody_address=${addresss}`,
    {
      headers: {
        api_key: process.env.NEYNAR_API_KEY as string,
      },
    },
  );
  const originalFID = userData.data.user.fid;
  const originalUserName = userData.data.user.username;
  console.log(addresss, originalFID, originalUserName);
  const timeStamp = Math.floor(Date.now() / 1000);
  const unRegisterSignature = await getSignature({
    account,
    name: originalUserName,
    timeStamp,
  });
  // unregister
  const unRegisterData = await axios.post(
    "https://fnames.farcaster.xyz/transfers",
    {
      name: originalUserName,
      from: originalFID, // Fid to transfer from (0 for a new registration)
      to: 0, // Fid to transfer to (0 to unregister)
      fid: originalFID, // Fid making the request (must match from or to)
      owner: account.address,
      timestamp: timeStamp,
      signature: unRegisterSignature,
    },
  );
  console.log("unRegisterData", unRegisterData.data);
  return originalUserName;
}
