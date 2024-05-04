// Manually create a state object
const state = {
  play: true,
  setPlay: (play) => {
    state.play = play;
  }
};

// Function to create a store
const createStore = (initialState) => {
  const store = { ...initialState };

  // Return an object containing the state and updater functions
  return {
    getState: () => store,
    setState: (update) => {
      Object.assign(store, update);
    }
  };
};

// Create the store with initial state
const { setState, getState } = createStore(state);

// Set up colors array
const colors = [0x8c75ff, 0x5cffab, 0xf74a8a, 0x3df2f2];

// Export the functions
export const useStore = {
  getState,
  setState
};
export { colors };
