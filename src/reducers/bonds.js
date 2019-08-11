import { FETCH_BONDS } from '../actions/types';

const INITIAL_STATE = {
  isLoading: false,
  items: []
};

const bonds = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_BONDS:
      return {
        items: [],
        isLoading: true
      };
    default:
      return state;
  }
};

export default bonds;
