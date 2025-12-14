import { useSelector } from "react-redux";
import "./App.css";
import RenderModal from "./modals/RenderModal/RenderModal";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const isModalOpen = useSelector((state) => state.modal.isOpen);
  return (
    <div className="App">
      <AppRoutes />
      {isModalOpen && <RenderModal />}
    </div>
  );
}

export default App;
