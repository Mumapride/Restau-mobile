import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/Button.jsx";
import { isAuthenticated } from "../lib/auth.js";

const NotFound = () => {
  const homeHref = isAuthenticated() ? "/dashboard" : "/login";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted text-primary">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-text">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        The page you are looking for does not exist or may have been moved.
        Check the address or return to the dashboard.
      </p>
      <div className="mt-6">
        <Link to={homeHref}>
          <Button>Go to {isAuthenticated() ? "dashboard" : "sign in"}</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
