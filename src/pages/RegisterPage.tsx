import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import { useAuth } from "../auth/useAuth";
import { TextField } from "../components/TextField";
import { registerSchema, type RegisterFormValues } from "../validation/auth";
import "../App.css";

function RegisterPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema) as Resolver<RegisterFormValues>,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      const data = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      if (!data.token) throw new Error("No token returned from server");
      setToken(data.token);
      navigate("/");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to register");
    }
  }

  return (
    <div className="page">
      <h1>Register</h1>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Name"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        {formError ? <p className="form-error">{formError}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="auth-alt">
        Already have an account? <Link to="/sign-in">Sign in</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
