import { useEffect, useMemo, useState } from "react";
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import { Transaction } from "@mysten/sui/transactions";
import Joyride from 'react-joyride';
import { toast } from "react-toastify";


const PACKAGE_ID: string = "0xe4e4e92c4526a680477791be3e3f54cccc22799f76325201921ce64408760216"
const MODULE_NAME: string = "todo"


const TODO_LIST_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::TodoList`;

export default function App() {
  const client = useSuiClient();
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem('todolist-joyride') !== 'done';
  });

  const joyrideSteps = [
    {
      target: '.connect-joyride',
      content: 'Connect your wallet to start exploring',
      disableBeacon: true,
    },
    {
      target: '.todo-joyride',
      content: 'Create a Todo new List and add items to do',
    },
  ];

  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [todoLists, setTodoLists] = useState<{ id: string; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedTodoListId, setSelectedTodoListId] = useState<string | null>(
    null
  );

  const handleJoyrideCallback = (data: any) => {
    if (data.status === 'finished' || data.status === 'skipped') {
      setShowTour(false);
      localStorage.setItem('todolist-joyride', 'done');
    }
  };

  const [listName, setListName] = useState("");
  const [newItem, setNewItem] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = account?.address;

  const fetchOwnedTodoLists = async () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    try {
      const objects = await client.getOwnedObjects({
        owner: account!.address,
        filter: { StructType: TODO_LIST_TYPE },
        options: { showContent: true },
      });

      const lists = objects.data.map((obj: any) => {
        const content: any = obj.data?.content;
        const name = content?.fields?.name ?? "Unnamed";
        return { id: obj.data!.objectId as string, name };
      });

      setTodoLists(lists);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch owned TodoLists");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    if (!selectedListId) return;
    setLoading(true);
    setError(null);
    try {
      const object = await client.getObject({ id: selectedListId, options: { showContent: true } });
      const content: any = object.data?.content;
      const typeOk = typeof content?.type === "string" && content.type.startsWith(TODO_LIST_TYPE);
      if (typeOk) {
        setItems(content.fields?.items ?? []);
		console.log(items)
      } else {
        setError("Invalid TodoList object");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const createTodoList = async () => {
    if (!account) {
		toast.error('Connect your wallet first');
		return;
	}
    setLoading(true);
    setError(null);
    try {
      const tx = new Transaction();
      const [todoList] = tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::new`,
        arguments: [tx.pure.string(listName)],
      });
      tx.transferObjects([todoList], account.address);
      const result = await signAndExecute({
        transaction: tx,
      });

      const txResult = await client.getTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
        },
      });

      const eventResult = await client.queryEvents({
        query: { Transaction: result.digest },
      });

      console.log(eventResult, "This is the event result");

      const newId = txResult.effects?.created?.[0]?.reference.objectId;
      if (newId) {
        setTodoLists([...todoLists, { id: newId, name: listName }]);
        setSelectedTodoListId(newId);
        setListName("");
      }
    } catch (err) {
      setError("Failed to create TodoList");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodoList = async (id: string) => {
    if (!account) {
		toast.error('Connect your wallet first');
		return;
	}
    setLoading(true);
    setError(null);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::delete`,
        arguments: [tx.object(id)],
      });
      const result = await signAndExecute({
        transaction: tx,
      });
      console.log(result);
      setTodoLists(todoLists.filter((list) => list.id !== id));
      if (selectedTodoListId === id) {
        setSelectedTodoListId(null);
        setItems([]);
      }
    } catch (err) {
      setError("Failed to delete TodoList");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!account) return;
    if (!selectedListId) return;
    setLoading(true);
    setError(null);

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::add`,
        arguments: [tx.object(selectedListId), tx.pure.string(newItem)],
      });
      const result = await signAndExecute({
        transaction: tx,
      });
      console.log(result);
      setNewItem("");
      fetchItems();
    } catch (err) {
      setError("Failed to add item");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (index: number) => {
   if (!account) {
		toast.error('Connect your wallet first');
		return;
	}
	if (!selectedListId) return;
    setLoading(true);
    setError(null);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::remove`,
        arguments: [tx.object(selectedListId), tx.pure.u64(index)],
      });
      const result = await signAndExecute({
        transaction: tx,
      });
      console.log(result);
      fetchItems();
    } catch (err) {
      setError("Failed to remove item");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account?.address) fetchOwnedTodoLists();
    else {
      setTodoLists([]);
      setSelectedListId(null);
      setItems([]);
    }
  }, [account?.address]);

  useEffect(() => {
    if (selectedListId) fetchItems();
  }, [selectedListId]);

 
  const selectedList = useMemo(() => todoLists.find((l) => l.id === selectedListId) || null, [todoLists, selectedListId]);

  return (
    <div className="min-h-screen bg-gray-50 relative p-4 md:p-8">
		{showTour && (
			<Joyride
			steps={joyrideSteps}
			continuous
			showSkipButton
			showProgress
			styles={{
				options: {
				zIndex: 10000,
				primaryColor: '#ffffff', 
				backgroundColor: '#ffffff',
				textColor: '#000000',
				arrowColor: '#ffffff',
				// overlayColor: 'rgba(0,0,0,0.7)',
				// width: 380,
				spotlightShadow: '0 0 0 1px #000000',
				},
				buttonNext: {
				backgroundColor: '#000000',
				color: '#ffffff',
				fontWeight: 700,
				borderRadius: 4,
				boxShadow: '0 0 0 2px #ffffff',
				},
				buttonBack: {
				color: '#000000',
				background: 'transparent',
				fontWeight: 700,
				},
				buttonSkip: {
				color: '#000000',
				background: 'transparent',
				fontWeight: 700,
				},
				tooltip: {
				backgroundColor: '#ffffff',
				color: '#000000',
				}
			}}
			locale={{
				back: 'Back',
				close: 'Close',
				last: 'Done',
				next: 'Next',
				skip: 'Skip',
			}}
			callback={handleJoyrideCallback}
			/>
		)}
      <div className="absolute right-0 left-0 py-2 max-w-5xl m-auto top-0 bg-gray-50 flex justify-end border-b h-16">
			<ConnectButton className="connect-joyride" />
      </div>

      <div className="mx-auto max-w-2xl mt-16 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Todo List App</h1>
          <p className="text-gray-600 mt-2">Organize your tasks with multiple lists</p>
        </div>

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 p-4 rounded-md">
            Connect your wallet to create and manage lists.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md">{error}</div>
        )}

        {selectedListId === null ? (
          <div className="space-y-6">
            {/* Create New List */}
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
                    onKeyDown={(e) => e.key === "Enter" && createTodoList()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <button
                    onClick={createTodoList}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 todo-joyride text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Processing..." : "Create List"}
                  </button>
                </div>
              </div>
            </div>

            {todoLists.length > 0 ? (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Your TodoLists
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Click on a list to view and manage its items</p>
                </div>
                <div className="p-6 space-y-2">
                  {todoLists.map((list) => (
                    <div
                      key={list.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedListId(list.id)}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{list.name}</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTodoList(list.id);
                        }}
                        className="p-2 text-white hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="py-8 px-6 text-center text-gray-500">
                  <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <p>No todo lists yet. Create your first list above!</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          selectedList && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => setSelectedListId(null)}
                      className="flex items-center gap-2 px-3 py-2 text-white hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedList.name}</h2>
                      <p className="text-gray-600 text-sm">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTodoList(selectedList.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete List
                    </button>
                  </div>
                </div>
              </div>

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
                      onKeyDown={(e) => e.key === "Enter" && addItem()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <button
                      onClick={addItem}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Processing..." : "Add Item"}
                    </button>
                  </div>
                </div>
              </div>

              {items.length > 0 ? (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Todo Items</h2>
                    <p className="text-gray-600 text-sm mt-1">Manage your tasks below</p>
                  </div>
                  <div className="p-6 space-y-2">
                    {items.map((text, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="flex-1 text-sm font-medium text-gray-900">{text}</span>
                        <button onClick={() => removeItem(idx)} className="p-2 text-white hover:text-red-700 hover:bg-red-50 rounded-md transition-colors">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="py-8 px-6 text-center text-gray-500">
                    <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p>No items yet. Add your first todo item above!</p>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
