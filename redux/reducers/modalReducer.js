import {SET_NEW_MODAL, SET_SALARY_MODAL, SET_UDPATE_MODAL} from "../actions/types";

const initialState = {
  newModal: false,
  updateModal: false,
  salaryModal: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_NEW_MODAL:
      return {
        ...state,
        newModal: action.payload
      }
    case SET_UDPATE_MODAL:
      return {
        ...state,
        updateModal: action.payload
      }
    case SET_SALARY_MODAL:
      return {
        ...state,
        salaryModal: action.payload
      }
    default:
      return state;
  }
}
