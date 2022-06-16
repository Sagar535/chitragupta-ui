import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import Jsona from 'jsona'
import AsyncSelect from 'react-select/async'
import DataTable from './DataTable'
import { columns } from '../../data/overtimeTableData'
import {
  fetchOvertimes,
  setShowModal,
} from '../../redux/actions/dashboardActions'
import { createOvertime } from '../../redux/actions/overtimeActions'
import Modal from '../modal'
import { Btn, Label } from '../formComponents'
import InputWithLabelAndError from '../InputWithLabelAndError'
import { TableContainer } from '../modalComponents'

const OvertimesDataTable = ({
  fetchOvertimes,
  createOvertime,
  setShowModal,
  approver,
  showModal,
}) => {
  const isAdmin = () => approver && approver.role === 'admin'
  const dataFormatter = new Jsona()
  const numberRegEx = /^\d*$/

  // const [showModal, setShowModal] = useState(false)
  const [overtime, setOvertime] = useState({
    approver_id: approver && approver.id,
  })
  const [userOptions, setUserOptions] = useState([])
  const [errors, setErrors] = useState({})

  const searchRequest = async (query) => {
    console.log('Searching')
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/users.json`,
        {
          headers: {
            Authorization: localStorage.token,
            'Content-type': 'application/json',
          },
          params: { search: query },
        },
      )

      const users = dataFormatter.deserialize(response.data.data)
      const updatedUserOptions = users.map((user) => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
      }))

      setUserOptions(updatedUserOptions)
      return updatedUserOptions
    } catch (error) {
      console.log(error)
      return []
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/users.json`,
          { headers: { Authorization: localStorage.token } },
        )
        const users = dataFormatter.deserialize(response.data.data)
        setUserOptions(
          users.map((user) => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name}`,
          })),
        )
      } catch (error) {
        console.log(error)
      }
    }

    fetchUsers()
  }, [])

  return (
    <>
      <TableContainer>
        <DataTable
          rowClick={() => console.log('')}
          columns={columns}
          fetchFunction={fetchOvertimes}
        >
          {isAdmin() && (
            <Btn
              className="bg-teal-500 hover:bg-teal-600"
              onClick={() => {
                setShowModal(true)
              }}
            >
              New Overtime
            </Btn>
          )}
        </DataTable>
      </TableContainer>

      {showModal && (
        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          title="New Overtime"
        >
          <InputWithLabelAndError
            name="seconds_tracked"
            errors={errors}
            onChange={(e) => {
              if (!e.target.value.match(numberRegEx))
                setErrors({ seconds_tracked: 'Must be a whole number.' })
              else setErrors({ seconds_tracked: null })
              setOvertime({ ...overtime, seconds_tracked: e.target.value })
            }}
          />

          <Label>Select salary</Label>
          <AsyncSelect
            onChange={(e) => {
              setOvertime({ ...overtime, user_id: e.value })
            }}
            defaultOptions={userOptions}
            // onInputChange={(query) => searchRequest(query)}
            loadOptions={(query) => searchRequest(query)}
          />
          <Btn
            className="bg-teal-500 hover:bg-teal-600"
            onClick={() => createOvertime(overtime)}
          >
            Submit
          </Btn>
        </Modal>
      )}
    </>
  )
}

export default connect(
  (state) => ({
    approver: state.auth.user,
    showModal: state.records.showModal,
  }),
  { fetchOvertimes, setShowModal, createOvertime },
)(OvertimesDataTable)
