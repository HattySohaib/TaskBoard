import { useState } from "react";
import { useBoardStore } from "../store/boardStore";
import BoardCard from "../components/board/BoardCard";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const BoardsView = () => {
  const { boards, createBoard } = useBoardStore();
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      createBoard(newBoardName);
      setNewBoardName("");
      setShowNewBoardInput(false);
    }
  };

  // Filter boards based on search term
  const filteredBoards = searchTerm
    ? boards.filter((board) =>
        board.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : boards;
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 dark-mode:bg-gray-900">
        {/* Top row: Boards title and search */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 18.375V5.625ZM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5ZM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5ZM3.375 15h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375Zm0-3.75h7.5a.375.375 0 0 0 .375-.375v-1.5A.375.375 0 0 0 10.875 9h-7.5A.375.375 0 0 0 3 9.375v1.5c0 .207.168.375.375.375Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-2 text-xl font-medium text-gray-900 dark-mode:text-gray-100">
              Boards
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search boards..."
              className="pl-10 w-full border border-gray-300 dark-mode:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark-mode:bg-gray-700 dark-mode:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Bottom row: Action buttons */}
        <div className="bg-white dark-mode:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark-mode:border-gray-700 mb-6">
          <div className="flex items-center justify-between space-x-3">
            <button
              onClick={() => setShowNewBoardInput(true)}
              className="flex items-center text-sm bg-gray-600 text-white px-3 py-1 rounded"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Create Board
            </button>{" "}
            <div className="flex items-center space-x-3">
              <button className="flex items-center text-sm border border-gray-300 dark-mode:border-gray-600 px-3 py-1 rounded bg-white dark-mode:bg-gray-800 text-gray-700 dark-mode:text-gray-200">
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        {showNewBoardInput && (
          <div className="bg-white dark-mode:bg-gray-800 p-4 rounded-lg shadow mb-6 border border-gray-200 dark-mode:border-gray-700">
            <h2 className="text-lg font-medium mb-4 dark-mode:text-gray-100">
              Create New Board
            </h2>
            <div className="flex">
              <input
                type="text"
                className="flex-1 border border-gray-300 dark-mode:border-gray-600 dark-mode:bg-gray-700 dark-mode:text-white rounded-lg px-3 py-2 mr-2"
                placeholder="Enter board name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
              />
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                onClick={handleCreateBoard}
              >
                Create
              </button>
              <button
                className="ml-2 text-gray-500 hover:text-gray-700 px-2"
                onClick={() => setShowNewBoardInput(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {filteredBoards.length === 0 ? (
          <div className="bg-white dark-mode:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark-mode:border-gray-700">
            <h3 className="text-lg font-medium text-gray-700 dark-mode:text-gray-200 mb-2">
              No boards found
            </h3>
            <p className="text-gray-500 dark-mode:text-gray-400 mb-4">
              {searchTerm
                ? "No boards match your search criteria."
                : "Create your first board to get started."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowNewBoardInput(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Create Board
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardsView;
