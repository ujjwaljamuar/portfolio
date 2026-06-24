import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ADMIN_AUTH_KEY } from "../services/apiClient";
import { loginAdmin } from "../services/blogService";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(ADMIN_AUTH_KEY) === "true") {
      navigate("/admin/blogs", { replace: true });
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginAdmin({ email, password });
      localStorage.setItem(ADMIN_AUTH_KEY, "true");
      toast.success("Logged in");
      navigate("/admin/blogs", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="adminAuthPage">
      <form onSubmit={submitHandler}>
        <h1>Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button disabled={loading} className={loading ? "disableBtn" : ""}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
};

export default AdminLogin;
