import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
