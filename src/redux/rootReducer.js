import { combineReducers } from "redux";
import modalReducer from "./slices/modalSlice";
import navBarReducer from "./slices/navBarSlice"; // (I fixed a typo here from your file)
import authReducer from "./slices/authSlice"; // <-- 1. IMPORT IT

const rootReducer = combineReducers({
  modal: modalReducer,
  navBar: navBarReducer,
  auth: authReducer, // <-- 2. ADD IT HERE
});

export default rootReducer;
