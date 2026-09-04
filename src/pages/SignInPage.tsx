import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { signInUser } from "../api";
import { useAuth } from "../auth/useAuth";
import { TextField } from "../components/TextField";
import { signInSchema, type SignInFormValues } from "../validation/auth";
import "../App.css";

function SignInPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: yupResolver(signInSchema) as Resolver<SignInFormValues>,
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInFormValues) {
    setFormError(null);
    try {
      const data = await signInUser(values);
      if (!data.token) throw new Error("No token returned from server");
      setToken(data.token);
      navigate("/");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to sign in");
    }
  }

  return (
    <div className="page">
      <h1>Sign in</h1>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {formError ? <p className="form-error">{formError}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="auth-alt">
        Need an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default SignInPage;
