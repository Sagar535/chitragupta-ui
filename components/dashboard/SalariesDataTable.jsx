import { connect } from 'react-redux'
import { useState } from 'react'
import axios from 'axios'
import Jsona from 'jsona'
import DataTable from './DataTable'
import { columns } from '../../data/salariesTableData'
import { TableContainer } from '../modalComponents'
import { Btn } from '../formComponents'
import Modal from '../modal'
import InputWithLabelAndError from '../InputWithLabelAndError'
import { fetchSalaries } from '../../redux/actions/dashboardActions'

const SalariesDataTable = ({ salaries, setSalaries, fetchSalaries }) => {
  const [salary, setSalary] = useState({})
  const [createNewSalary, setCreateNewSalary] = useState(false)
  const [errors, setErrors] = useState({})

  const dataFormatter = new Jsona()
  const creatingNewSalary = () => setCreateNewSalary(true)
  const numberRegEx = /^\d+.?\d*$/

  const updateSalary = (e) => {
    delete errors[e.target.name]
    if (!e.target.value.match(numberRegEx))
      setErrors({ ...errors, [e.target.name]: 'Must be a number.' })
    setSalary({ ...salary, [e.target.name]: e.target.value })
  }

  // this is required because if we submit empty form we are getting error but status is stil 200:OK
  const checkIfFormIsValid = () => {
    let errorCount = 0
    ;[
      'basic_salary',
      'commitment_bonus',
      'allowance',
      'festival_bonus',
    ].forEach((field) => {
      if (salary[field] === undefined) {
        errorCount += 1
        setErrors({ ...errors, [field]: "Can't be blank." })
      } else if (!String(salary[field]).match(numberRegEx)) {
        errorCount += 1
        setErrors({ ...errors, [field]: 'Must be a number.' })
      }
    })

    return errorCount
  }

  const createSalary = async () => {
    if (checkIfFormIsValid() === 0) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/salaries.json`,
          {
            salary,
          },
          {
            headers: {
              Authorization: localStorage.token,
            },
          },
        )

        if (response.statusText === 'OK') {
          setSalaries([dataFormatter.deserialize(response.data), ...salaries])
          setCreateNewSalary(false)
          setSalary({})
        }
      } catch (error) {
        // error block of code
      }
    }
  }

  return (
    <>
      <TableContainer>
        <div className="flex justify-end py-4">
          <Btn
            className="bg-teal-500 hover:bg-teal-600"
            onClick={creatingNewSalary}
          >
            New Salary
          </Btn>
        </div>

        <DataTable
          columns={columns}
          fetchFunction={fetchSalaries}
        />
      </TableContainer>
      {createNewSalary && (
        <Modal
          showModal={createNewSalary}
          setShowModal={setCreateNewSalary}
          title="New Salary"
        >
          <div className="flex flex-wrap">
            {[
              'basic_salary',
              'commitment_bonus',
              'allowance',
              'festival_bonus',
              'life_insurance_deduction',
            ].map((field) => (
              <InputWithLabelAndError
                name={field}
                onChange={updateSalary}
                value={salary[field]}
                errors={errors}
              />
            ))}
          </div>

          <Btn className="bg-teal-500 hover:bg-teal-600" onClick={createSalary}>
            Submit
          </Btn>
        </Modal>
      )}
    </>
  )
}

export default connect(() => ({}), { fetchSalaries })(SalariesDataTable)
