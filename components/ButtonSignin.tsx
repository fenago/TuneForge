/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import config from "@/config";

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
const ButtonSignin = ({
  text = "Get started",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleClick = () => {
    console.log("ButtonSignin clicked, status:", status);
    if (status === "authenticated") {
      console.log("User authenticated, redirecting to:", config.auth.callbackUrl);
      router.push(config.auth.callbackUrl);
    } else {
      console.log("User not authenticated, redirecting to login page");
      router.push("/login");
    }
  };

  if (status === "authenticated") {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={extraStyle || "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"}
      >
        {session.user?.image ? (
          <img
            src={session.user?.image}
            alt={session.user?.name || "Account"}
            className="w-6 h-6 rounded-full shrink-0"
            referrerPolicy="no-referrer"
            width={24}
            height={24}
          />
        ) : (
          <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
            {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
          </span>
        )}
        {session.user?.name || session.user?.email || "Account"}
      </Link>
    );
  }

  return (
    <button
      className={extraStyle || "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"}
      onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default ButtonSignin;
