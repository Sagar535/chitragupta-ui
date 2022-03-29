import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import axios from "axios";
import Jsona from "jsona";

export const AppContext = createContext();

export default function AppProvider({ children }) {
  const [user, setUser] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [users, setUsers] = useState([]);

  const dataFormatter = new Jsona();

  const fetchLeaveRequests = useCallback(async () => {
    try {
      const leave_requests = await axios.get(
        `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/leave_requests.json`,
        { headers: { Authorization: localStorage.token } }
      );

      // sets global state for leave requests
      setLeaveRequests(dataFormatter.deserialize(leave_requests.data));
    } catch (error) {
      console.log(error);
    }
  }, [leaveRequests, user]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/users.json`,
        { headers: { Authorization: localStorage.token } }
      );

      setUsers(dataFormatter.deserialize(response.data));
    } catch (error) {
      console.log(error);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaveRequests();

    fetchUsers();
  }, [user]);

  return (
    <AppContext.Provider
      value={{ user, setUser, leaveRequests, setLeaveRequests, users }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(AppContext);
};