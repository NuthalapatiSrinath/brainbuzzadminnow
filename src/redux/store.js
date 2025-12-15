import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: [
          "modal.modalData.onSuccess",
          "modal.modalData.onConfirm", // Added this
        ],
        // Ignore these paths in the action payload
        ignoredActionPaths: [
          "payload.modalData.onSuccess",
          "payload.modalData.onConfirm", // Added this
        ],
      },
    }),
});

export default store;
