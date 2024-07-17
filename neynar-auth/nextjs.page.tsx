import { useEffect } from "react";


const clientId = "your client id";
const url = `https://app.neynar.com/login?client_id=${clientId}`;
const AuthPage = () => {
  useEffect(() => {
    window.location.href = url;
  }, []);

  return (
      <div className="mx-auto max-w-screen-lg">
        <div className="mt-16 flex flex-row justify-center">
          <a href={url} className="hover:text-primary text-lg hover:underline">
            redirecting... click here if not redirected
          </a>
        </div>
      </div>
  );
};

export default AuthPage;
