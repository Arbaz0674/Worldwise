import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();

function reducer(currState, action) {
  switch (action.type) {
    case "login":
      return { ...currState, user: action.payload, isAuthenticated: true };
    case "logout":
      return { ...currState, user: "null", isAuthenticated: false };
    default:
      throw new Error("Unknown Action Type");
  }
}

const FAKE_USER = {
  name: "Jack",
  email: "jack@example.com",
  password: "qwerty",
  avatar: "https://i.pravatar.cc/100?u=zz",
};

function AuthProvider({ children }) {
  const initialState = { user: "null", isAuthenticated: false };
  const [userState, dispatch] = useReducer(reducer, initialState);
  const { user, isAuthenticated } = userState;
  function login(email, password) {
    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      dispatch({ type: "login", payload: FAKE_USER });
    }
  }

  function logout() {
    dispatch({ type: "logout" });
  }
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("AuthContext was used outside AuthProvider");
  }
  return context;
}
export { AuthProvider, useAuth };