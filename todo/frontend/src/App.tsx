"use client"

import type React from "react"
import { useState } from "react"

interface TodoItem {
  id: number
  text: string
}

interface TodoList {
  id: number
  name: string
  items: TodoItem[]
}

function App() {
  const [todoLists, setTodoLists] = useState<TodoList[]>([])
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [listName, setListName] = useState("")
  const [newItem, setNewItem] = useState("")
  const [nextListId, setNextListId] = useState(1)
  const [nextItemId, setNextItemId] = useState(1)

  const createList = () => {
    if (listName.trim()) {
      const newList: TodoList = {
        id: nextListId,
        name: listName.trim(),
        items: [],
      }
      setTodoLists([...todoLists, newList])
      setListName("")
      setNextListId(nextListId + 1)
    }
  }

  const addItem = () => {
    if (newItem.trim() && selectedListId !== null) {
      setTodoLists((lists) =>
        lists.map((list) =>
          list.id === selectedListId
            ? { ...list, items: [...list.items, { id: nextItemId, text: newItem.trim() }] }
            : list,
        ),
      )
      setNewItem("")
      setNextItemId(nextItemId + 1)
    }
  }

  const removeItem = (itemId: number) => {
    if (selectedListId !== null) {
      setTodoLists((lists) =>
        lists.map((list) =>
          list.id === selectedListId ? { ...list, items: list.items.filter((item) => item.id !== itemId) } : list,
        ),
      )
    }
  }

  const deleteList = (listId: number) => {
    setTodoLists((lists) => lists.filter((list) => list.id !== listId))
    if (selectedListId === listId) {
      setSelectedListId(null)
    }
  }

  const selectList = (listId: number) => {
    setSelectedListId(listId)
  }

  const goBackToLists = () => {
    setSelectedListId(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action()
    }
  }

  const selectedList = todoLists.find((list) => list.id === selectedListId)

  return (
    <div className="min-h-screen bg-gray-50 relative p-4 md:p-8">
		<div className="absolute right-0 left-0 py-2 max-w-5xl m-auto top-0 bg-gray-50 flex justify-end  border-b h-16">
			<button>Connect Wallet</button>
		</div>
      <div className="mx-auto max-w-2xl mt-16 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">TodoList App</h1>
          <p className="text-gray-600 mt-2">Organize your tasks with multiple lists</p>
        </div>

        {selectedListId === null ? (
          <div className="space-y-6">
            {/* Create New List Card */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New TodoList
                </h2>
                <p className="text-gray-600 text-sm mt-1">Add a new todo list to organize your tasks</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input
					type="text"
					placeholder="Enter list name..."
					value={listName}
					onChange={(e) => setListName(e.target.value)}
					onKeyPress={(e) => handleKeyPress(e, createList)}
					className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
				  />
                  <button
                    onClick={createList}
                    disabled={!listName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Create List
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Lists */}
            {todoLists.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    Your TodoLists
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Click on a list to view and manage its items</p>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    {todoLists.map((list) => (
                      <div
                        key={list.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => selectList(list.id)}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{list.name}</h3>
                          <p className="text-sm text-gray-600">
                            {list.items.length} {list.items.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteList(list.id)
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {todoLists.length === 0 && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="py-8 px-6">
                  <div className="text-center text-gray-500">
                    <svg
                      className="h-12 w-12 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    <p>No todo lists yet. Create your first list above!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Show selected list view */
          selectedList && (
            <div className="space-y-6">
              {/* List Header with Back Button */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={goBackToLists}
                      className="flex items-center gap-2 px-3 py-2 text-white hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Lists
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedList.name}</h2>
                      <p className="text-gray-600 text-sm">
                        {selectedList.items.length} {selectedList.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteList(selectedList.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete List
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Item Card */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Item
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter todo item..."
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addItem)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <button
                      onClick={addItem}
                      disabled={!newItem.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List Card */}
              {selectedList.items.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Todo Items</h2>
                    <p className="text-gray-600 text-sm mt-1">Manage your tasks below</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2">
                      {selectedList.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <span className="flex-1 text-sm font-medium text-gray-900">{item.text}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedList.items.length === 0 && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="py-8 px-6">
                    <div className="text-center text-gray-500">
                      <svg
                        className="h-12 w-12 mx-auto mb-4 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p>No items yet. Add your first todo item above!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default App