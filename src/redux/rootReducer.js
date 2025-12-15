import { combineReducers } from "redux";
import modalReducer from "./slices/modalSlice";
import navBarReducer from "./slices/navBarSlice";
import authReducer from "./slices/authSlice";

const rootReducer = combineReducers({
  modal: modalReducer,
  navBar: navBarReducer,
  auth: authReducer,
});

export default rootReducer;
