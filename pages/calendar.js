import { useState } from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction' // needed for dayClick
import axios from 'axios'
import Jsona from 'jsona'
import { useRouter } from 'next/router'
import Modal from '../components/modal'
import { Input, Label, Select, Option, Btn } from '../components/formComponents'
import LeaveBalanceBadge from '../components/leaveBalanceBadge'
import { handleUnauthorized } from '../lib/utils'
import Navbar from '../components/layout/Navbar'


const Calendar = ({ user }) => {
  const router = useRouter()

  const [leaveRequest, setLeaveRequest] = useState({})
  const [creatingLeaveRequest, setCreatingLeaveRequest] = useState(false)
  const [updatingLeaveRequest, setUpdatingLeaveRequest] = useState(false)
  const [error, setError] = useState('')

  const dataFormatter = new Jsona()

  const isAdmin = () => user.role === 'admin'

  const colorMap = (status) => {
    switch (status) {
      case 'pending':
        return 'blue'
      case 'rejected':
        return 'red'
      case 'approved':
        return 'green'
      default:
        return 'blue'
    }
  }

  const fullCalendarEndDate = (date) => {
    const end_date = new Date(date)
    end_date.setDate(end_date.getDate() + 1)
    end_date.toLocaleString()
    // we need to make sure we have date in YY-MM-DD format
    // '2022-1-1' is not valid date
    // '2022-01-01' is valid date
    return `${end_date.getFullYear()}-${`0${end_date.getMonth() + 1}`.slice(
      -2,
    )}-${`0${end_date.getDate()}`.slice(-2)}`
  }

  const createLeaveRequest = (info) => {
    setError('')

    // end date should be the last day of the leave, better not include the present day
    const endDate = new Date(info.endStr)
    endDate.setDate(endDate.getDate() - 1)
    endDate.toLocaleString()

    setCreatingLeaveRequest(true)

    setLeaveRequest({
      ...leaveRequest,
      leave_type: 'sick_leave',
      start_date: info.startStr,
      end_date: endDate,
      status: 'pending',
    })
  }

  const addEvent = async () => {
    console.log('Adding leave request....')
    // create leave request
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/leave_requests.json`,
        {
          leave_request: leaveRequest,
        },
        { headers: { Authorization: localStorage.token } },
      )

      if (response.statusText === 'OK') {
        setCreatingLeaveRequest(false)
        // add newly created leave request to the calendar
        const leave_request = dataFormatter.deserialize(response.data)
        leave_request.start = leave_request.start_date
        leave_request.end = leave_request.end_date
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      setError(
        (error.response &&
          (error.response.data.message || error.response.data.error)) ||
          error.message,
      )
      handleUnauthorized(error, router)
    }
  }

  const updateEvent = async (status) => {
    const leave_request = {
      ...leaveRequest,
      approver_id: (isAdmin() || null) && user.id,
      status,
    }

    // update leave request
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/leave_requests/${leaveRequest.id}.json`,
        {
          leave_request,
        },
        { headers: { Authorization: localStorage.token } },
      )

      if (response.statusText === 'OK') {
        setUpdatingLeaveRequest(false)
        // add updated leave request to the calendar
        const leave_request = dataFormatter.deserialize(response.data)
        leave_request.start = leave_request.start_date
        leave_request.end = leave_request.end_date

        // find index of the updated leave_request
        // const index = leaveRequests.findIndex(
        //   (leave) => leave.id === leave_request.id,
        // )

        // update leave_request at the index
        // const leave_requests = [...leaveRequests]
        // leave_requests[index] = leave_request
        //
        // setLeaveRequests(leave_requests)
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      setError(
        (error.response && JSON.stringify(error.response.data)) ||
          error.message,
      )
      handleUnauthorized(error, router)
    }
  }

  const updateLeaveRequest = async ({ event }) => {
    setError('')

    //  first get id of leave request with
    const { id } = event

    // make request to remote API to get leave request detail
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/leave_requests/${id}`,
      { headers: { Authorization: localStorage.token } },
    )

    const leave_request = dataFormatter.deserialize(response.data)
    setLeaveRequest(leave_request)

    setUpdatingLeaveRequest(true)
  }

  return (
    <>
      <Head>
        <title>Chitragupta App</title>
        <meta name="description" content="chitragupta" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="p-8">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          events={async (info) => {
            const start = info.start.toISOString().substring(0, 10)
            const end = info.end.toISOString().substring(0, 10)

            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/leave_requests.json`,
              {
                params: { start, end, all_leaves: true },
                headers: { Authorization: localStorage.token },
              },
            )

            const leave_requests = dataFormatter.deserialize(response.data.data)

            return leave_requests.map((leave) => ({
              ...leave,
              start: leave.start_date,
              end: fullCalendarEndDate(leave.end_date),
              color: colorMap(leave.status),
            }))
          }}
          selectable
          editable
          select={createLeaveRequest}
          eventClick={updateLeaveRequest}
        />
      </div>
      {creatingLeaveRequest && (
        <Modal
          setShowModal={setCreatingLeaveRequest}
          showModal={creatingLeaveRequest}
          title='New Leave Request'
          leaveRequest={leaveRequest}
        >
          <div>
            <div className="flex justify-between">
              <LeaveBalanceBadge
                label='Sick Leave Balance'
                balance={user.sick_leave_balance || 0}
              />
              <LeaveBalanceBadge
                label='Paid Leave Balance'
                balance={user.paid_leave_balance || 0}
              />
              <LeaveBalanceBadge
                label='Unpaid Leave Balance'
                balance={user.unpaid_leave_balance || 0}
              />
            </div>

            {error !== '' && <span className="mb-2 text-red-500">{error}</span>}
            <Label>Leave Type</Label>
            <Select
              onChange={(e) =>
                setLeaveRequest({ ...leaveRequest, leave_type: e.target.value })
              }
            >
              <Option
                value="sick_leave"
                selected={leaveRequest.leave_type === 'sick_leave'}
              >
                Sick Leave
              </Option>
              <Option
                value="personal"
                selected={leaveRequest.leave_type === 'personal'}
              >
                Personal
              </Option>
              <Option
                value="others"
                selected={leaveRequest.leave_type === 'others'}
              >
                Others
              </Option>
            </Select>

            <Label>Reason</Label>
            <Input
              onChange={(e) =>
                setLeaveRequest({ ...leaveRequest, title: e.target.value })
              }
              value={leaveRequest.title}
            />

            <Btn className="bg-blue-500 hover:bg-blue-600" onClick={addEvent}>
              Submit
            </Btn>
          </div>
        </Modal>
      )}

      {updatingLeaveRequest && (
        <Modal
          setShowModal={setUpdatingLeaveRequest}
          showModal={updatingLeaveRequest}
          title={`${leaveRequest.user.first_name} ${leaveRequest.user.last_name}`}
        >
          <div className="flex justify-between">
            <LeaveBalanceBadge
              label='Sick Leave Balance'
              balance={leaveRequest.user.sick_leave_balance}
            />
            <LeaveBalanceBadge
              label='Paid Leave Balance'
              balance={leaveRequest.user.paid_leave_balance}
            />
            <LeaveBalanceBadge
              label='Unpaid Leave Balance'
              balance={leaveRequest.user.unpaid_leave_balance}
            />
          </div>
          <div>
            {error !== '' && <span className="mb-2 text-red-500">{error}</span>}
            <Label>Leave Type</Label>
            <Select
              onChange={(e) =>
                setLeaveRequest({ ...leaveRequest, leave_type: e.target.value })
              }
              disabled={isAdmin()}
            >
              <Option
                value="sick_leave"
                selected={leaveRequest.leave_type === 'sick_leave'}
              >
                Sick Leave
              </Option>
              <Option
                value="personal"
                selected={leaveRequest.leave_type === 'personal'}
              >
                Personal
              </Option>
              <Option
                value="others"
                selected={leaveRequest.leave_type === 'others'}
              >
                Others
              </Option>
            </Select>

            <Label>Reason</Label>
            <Input
              onChange={(e) =>
                setLeaveRequest({ ...leaveRequest, title: e.target.value })
              }
              value={leaveRequest.title}
              disabled={isAdmin()}
            />

            {isAdmin() && (
              <>
                <Label>Reply</Label>
                <Input
                  onChange={(e) =>
                    setLeaveRequest({
                      ...leaveRequest,
                      reply_attributes: { reason: e.target.value },
                    })
                  }
                  value={leaveRequest.reply && leaveRequest.reply.reason}
                />
                <Btn
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => updateEvent('rejected')}
                >
                  Reject
                </Btn>
                <Btn
                  className="ml-2 bg-green-500 hover:bg-green-600"
                  onClick={() => updateEvent('approved')}
                >
                  Approve
                </Btn>
              </>
            )}

            {!isAdmin() && (
              <Btn
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => updateEvent(leaveRequest.status)}
              >
                Update
              </Btn>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}

const mapStateToProps = (state) => ({
  user: state.auth.user
})
export default connect(mapStateToProps)(Calendar)
