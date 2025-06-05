import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import BoardsView from "./pages/BoardsView";
import BoardDetailPage from "./pages/BoardDetailPage";
import NotFound from "./pages/NotFound";
import "./components/board/TaskStyles.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<BoardsView />} />
          <Route path="board/:boardId" element={<BoardDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
