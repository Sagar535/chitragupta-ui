import axios from "axios";
import {SET_REDIRECT} from "./types";
import {clearErrors, returnAlerts, returnErrors} from "./alertActions";
import {tokenConfig} from "./authActions";
import {setUpdateModal} from "./modalActions";

export const profileFormSubmit = (userId, user) => async (dispatch, getState) => {
    try {
        // patch request to user resource remote url
        await axios.put(
            `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/users/${userId}.json`,
            {
                user,
            },
            tokenConfig(getState)
        );

        dispatch(clearErrors())
        dispatch({
            type: SET_REDIRECT,
            payload: "/"
        })
    } catch (error) {
        dispatch(returnErrors(
            error.response?.message,
            404,
            'PROFILE_FORM_SUBMIT_FAIL'
        ))
    }
}

export const updateUser = (userId, user) => async (dispatch, getState) => {
    try {
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/users/${userId}.json`,
          {
              user
          },
          {
              headers: {
                  Authorization: getState().auth.token,
              },
          },
        )

        if (response.statusText === "OK") {
            dispatch(setUpdateModal(false))
            dispatch(returnAlerts(
              "Successfully updated user",
              200
            ))
        }
    } catch (error) {
        dispatch(returnErrors(
          error.response?.message || "Failed to update user",
          400
        ))
    }
}