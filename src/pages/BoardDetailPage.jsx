import { useParams } from "react-router-dom";
import { useBoardStore } from "../store/boardStore";
import BoardDetail from "../components/board/BoardDetail";

const BoardDetailPage = () => {
  const { boardId } = useParams();
  const { getBoardById } = useBoardStore();
  const board = getBoardById(boardId);

  // If board not found
  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark-mode:text-gray-400">Board not found</p>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col">
      <BoardDetail boardId={boardId} />
    </div>
  );
};

export default BoardDetailPage;
