import axios from "axios";
import {returnAlerts, returnErrors} from "./alertActions";
import {SET_SALARY_MODAL} from "./types";

export const createSalary = (salary) => async (dispatch, getState) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/salaries.json`,
      {
        salary,
      },
      {
        headers: {
          Authorization: getState().auth.token,
        },
      },
    )
    dispatch(
      returnAlerts("Successfully created new salary", response.status, 'RECORD_CREATION_SUCCESS')
    )
  } catch (error) {
    dispatch(
      returnErrors(
        error.response && error.response.data,
        error.resposne && error.response.status,
      ),
    )
  }
}

export const uploadSalaryCSV = (formData) => async(dispatch, getState) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/bulk_upload_salaries.json`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: getState().auth.token,
        },
      },
    )

    if (response.statusText === 'OK') {
      dispatch(returnAlerts(
        response.data.message,
        response.status
      ))
    } else {
      dispatch(returnErrors(
        response.data.message,
        response.status
      ))
    }
  } catch(error) {
    dispatch(returnErrors(
      error.response && error.response.data,
      error.response && error.response.status
    ))
  }
}

export const setSalaryModal = (payload) => (dispatch) => {
  dispatch({type: SET_SALARY_MODAL, payload})
}

export const setUserSalary = (userId, salary, salaryStartDate) => async (dispatch, getState) => {
  if(!salary) {
    dispatch(returnErrors("Please select the salary", 400))
    return
  }

  if(!salaryStartDate) {
    dispatch(returnErrors("Please select the salaryStart date", 400))
    return
  }

  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/users/${userId}.json`,
      {
        user: {
          user_salaries_attributes: [
            {
              salary_id: salary,
              start_date: salaryStartDate,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: getState().auth.token,
        },
      },
    )

    if (response.statusText === "OK") {
      dispatch(setSalaryModal(false))
      dispatch(returnAlerts("Successfully updated users salary", 200))
    }
  } catch (error) {
    dispatch(returnErrors(
      error.response && error.response.data,
      error.response && error.response.status
    ))
  }
}
