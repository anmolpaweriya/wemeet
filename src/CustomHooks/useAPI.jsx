import React, { useContext } from "react";

const APIContext = React.createContext();
export function useGetAPI() {
  return useContext(APIContext);
}

export default function APIProvider({ children }) {
  // const api = "http://localhost:8000";
  // const api = "https://attendancesystem.glitch.me"
  const api = "https://wemeet.linkpc.net";

  return <APIContext.Provider value={api}>{children}</APIContext.Provider>;
}
