import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";

const useHistoryStore = create()(
	persist(
		devtools(
			immer((set) => ({
				history: [],

				addMessage: (role, message) =>
					set((state) => ({
						...state,
						history: state.history.concat({
							id: Date.now(),
							role: role,
							message: message,
						}),
					})),
			}))
		),
		{
			name: "history",
			getStorage: () => localStorage,
		}
	)
);

export default useHistoryStore;
