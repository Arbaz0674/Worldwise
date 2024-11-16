import {
  createContext,
  useState,
  useEffect,
  useContext,
  useReducer,
} from "react";

const CitiesContext = createContext();

function reducer(currState, action) {
  switch (action.type) {
    case "loading":
      return { ...currState, isLoading: true };
    case "cities/loaded":
      return { ...currState, isLoading: false, cities: action.payload };
    case "city/loaded":
      return { ...currState, isLoading: false, currentCity: action.payload };
    case "city/created":
      return {
        ...currState,
        cities: [...currState.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...currState,
        isLoading: false,
        cities: currState.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return { ...currState, isLoading: false, err: action.payload };

    default:
      throw new Error("Unknown Action Type");
  }
}

function CitiesProvider({ children }) {
  const initialState = {
    cities: [],
    isLoading: false,
    currentCity: {},
    error: "",
  };
  const [cityState, dispatch] = useReducer(reducer, initialState);
  const { cities, isLoading, currentCity, error } = cityState;

  useEffect(function () {
    async function fetchCities() {
      try {
        dispatch({ type: "loading" });
        const res = await fetch(`http://localhost:9000/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was error in loading the data",
        });
      }
    }
    fetchCities();
  }, []);

  async function getCity(id) {
    try {
      if (Number(id) === currentCity.id) return;
      dispatch({ type: "loading" });
      const res = await fetch(`http://localhost:9000/cities/${id}`);
      const data = await res.json();
      dispatch({ type: "city/loaded", payload: data });
    } catch {
      dispatch({ type: "rejected", payload: "Error Loading the Data" });
    }
  }

  async function createCity(newCity) {
    try {
      dispatch({ type: "loading" });
      const res = await fetch(`http://localhost:9000/cities`, {
        method: `POST`,
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
    } catch {
      dispatch({ type: "rejected", payload: "Error on Creating the City" });
    }
  }

  async function deleteCity(id) {
    try {
      dispatch({ type: "loading" });
      await fetch(`http://localhost:9000/cities/${id}`, {
        method: `DELETE`,
      });
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({ type: "rejected", payload: "Error on Deleting the Data" });
    }
  }
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const citiesContext = useContext(CitiesContext);
  return citiesContext;
}
export { CitiesProvider, useCities };
