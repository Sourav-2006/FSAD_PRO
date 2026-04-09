import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient.js'

const ROLES = ['Admin', 'Donor', 'Recipient', 'Logistics Coordinator']

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState('Donor')
  const [activeRole, setActiveRole] = useState('Admin')

  const [drives, setDrives] = useState([])
  const [donations, setDonations] = useState([])
  const [requests, setRequests] = useState([])
  const [logisticsTasks, setLogisticsTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [drivesRes, donationsRes, requestsRes, tasksRes] = await Promise.all([
        supabase.from('drives').select('*'),
        supabase.from('donations').select('*'),
        supabase.from('requests').select('*'),
        supabase.from('logistics_tasks').select('*')
      ])

      if (drivesRes.error) console.error('Drives error:', drivesRes.error)
      else setDrives(drivesRes.data || [])

      if (donationsRes.error) console.error('Donations error:', donationsRes.error)
      else setDonations(donationsRes.data || [])

      if (requestsRes.error) console.error('Requests error:', requestsRes.error)
      else setRequests(requestsRes.data || [])

      if (tasksRes.error) console.error('Tasks error:', tasksRes.error)
      else setLogisticsTasks(tasksRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = (role) => {
    const finalRole = role || 'Donor'
    setCurrentUserRole(finalRole)
    setActiveRole(finalRole)
    setIsAuthenticated(true)
  }

  const addDrive = async (drive) => {
    const { data, error } = await supabase.from('drives').insert(drive).select()
    if (error) {
      console.error('Error adding drive:', error)
      return
    }
    setDrives([...drives, ...data])
  }

  const addDonation = async (donation) => {
    const { data, error } = await supabase.from('donations').insert(donation).select()
    if (error) {
      console.error('Error adding donation:', error)
      return
    }
    setDonations([...donations, ...data])
  }

  const addRequest = async (request) => {
    const { data, error } = await supabase.from('requests').insert(request).select()
    if (error) {
      console.error('Error adding request:', error)
      return
    }
    setRequests([...requests, ...data])
  }

  const addTask = async (task) => {
    const { data, error } = await supabase.from('logistics_tasks').insert(task).select()
    if (error) {
      console.error('Error adding task:', error)
      return
    }
    setLogisticsTasks([...logisticsTasks, ...data])
  }

  const updateTaskStatus = async (id, status) => {
    const { error } = await supabase.from('logistics_tasks').update({ status }).eq('id', id)
    if (error) {
      console.error('Error updating task:', error)
      return
    }
    setLogisticsTasks(logisticsTasks.map(task =>
      task.id === id ? { ...task, status } : task
    ))
  }

  if (loading) {
    return <div className="loading">Loading ReliefConnect...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>ReliefConnect</h1>
        <p className="subtitle">
          Donate essentials, coordinate logistics, and support communities in need.
        </p>
      </header>

      {!isAuthenticated && (
        <AuthView
          onAuthSuccess={handleAuthSuccess}
          defaultRole={currentUserRole}
        />
      )}

      {isAuthenticated && (
        <>
          <section className="role-tabs">
            {ROLES.map((role) => (
              <button
                key={role}
                className={`tab-button ${
                  activeRole === role ? 'tab-button-active' : ''
                }`}
                onClick={() => setActiveRole(role)}
              >
                {role}
              </button>
            ))}
          </section>

          <main className="app-main">
            {activeRole === 'Admin' && (
              <AdminView
                drives={drives}
                donations={donations}
                requests={requests}
                onCreateDrive={addDrive}
              />
            )}

            {activeRole === 'Donor' && (
              <DonorView
                drives={drives}
                donations={donations}
                onAddDonation={addDonation}
              />
            )}

            {activeRole === 'Recipient' && (
              <RecipientView
                requests={requests}
                onAddRequest={addRequest}
              />
            )}

            {activeRole === 'Logistics Coordinator' && (
              <LogisticsView
                drives={drives}
                donations={donations}
                requests={requests}
                logisticsTasks={logisticsTasks}
                onAddTask={addTask}
                onUpdateTaskStatus={updateTaskStatus}
              />
            )}
          </main>
        </>
      )}
    </div>
  )
}

function AuthView({ onAuthSuccess, defaultRole }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState(defaultRole || 'Donor')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) return
    onAuthSuccess(role)
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <div className="auth-toggle">
          <button
            type="button"
            className={`auth-toggle-button ${
              mode === 'login' ? 'auth-toggle-active' : ''
            }`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-toggle-button ${
              mode === 'signup' ? 'auth-toggle-active' : ''
            }`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Access your dashboard to donate, request help, or coordinate logistics.'
            : 'Create your ReliefConnect account to start supporting or receiving relief.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label>
              Full name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          <label>
            I am a
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="primary-button auth-primary-button">
            {mode === 'login' ? 'Login to ReliefConnect' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer-note">
          This is a demo project screen – authentication is simulated for FSAD.
        </p>
      </div>
    </section>
  )
}

function AdminView({ drives, donations, requests, onCreateDrive }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    type: 'Food',
    urgency: 'Normal',
    startDate: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.location || !form.startDate) return

    onCreateDrive({
      id: Date.now(),
      ...form,
      status: 'Open',
    })

    setForm({
      name: '',
      location: '',
      type: 'Food',
      urgency: 'Normal',
      startDate: '',
    })
  }

  return (
    <div className="panel">
      <h2>Admin Dashboard</h2>
      <p className="panel-description">
        Oversee donation drives, monitor activity, and ensure transparency.
      </p>

      <div className="stats-grid">
        <StatCard label="Active Drives" value={drives.length} />
        <StatCard label="Total Donations" value={donations.length} />
        <StatCard label="Requests Pending" value={requests.length} />
      </div>

      <section className="section">
        <h3>Create Donation Drive</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Drive name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Flood relief - Chennai"
            />
          </label>
          <label>
            Location / Region
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Chennai, Tamil Nadu"
            />
          </label>
          <label>
            Drive type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>Food</option>
              <option>Clothing</option>
              <option>Shelter Supplies</option>
              <option>Medical</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Urgency
            <select
              value={form.urgency}
              onChange={(e) => setForm({ ...form, urgency: e.target.value })}
            >
              <option>Normal</option>
              <option>Urgent</option>
              <option>Emergency</option>
            </select>
          </label>
          <label>
            Start date
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
            />
          </label>

          <button type="submit" className="primary-button">
            Create drive
          </button>
        </form>
      </section>

      <section className="section">
        <h3>Current Drives</h3>
        {drives.length === 0 ? (
          <p className="empty-state">No drives yet. Create the first one.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Urgency</th>
                  <th>Start date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {drives.map((drive) => (
                  <tr key={drive.id}>
                    <td>{drive.name}</td>
                    <td>{drive.location}</td>
                    <td>{drive.type}</td>
                    <td>{drive.urgency}</td>
                    <td>{drive.startDate}</td>
                    <td>{drive.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function DonorView({ drives, donations, onAddDonation }) {
  const [form, setForm] = useState({
    donorName: '',
    itemName: '',
    category: 'Food',
    quantity: 1,
    condition: 'New',
    driveId: '',
    notes: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.donorName || !form.itemName) return

    onAddDonation({
      id: Date.now(),
      ...form,
      status: 'Pending pickup',
    })

    setForm({
      donorName: '',
      itemName: '',
      category: 'Food',
      quantity: 1,
      condition: 'New',
      driveId: '',
      notes: '',
    })
  }

  return (
    <div className="panel">
      <h2>Donor Portal</h2>
      <p className="panel-description">
        List items you want to donate and track their status.
      </p>

      <section className="section">
        <h3>New Donation</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Your name
            <input
              type="text"
              value={form.donorName}
              onChange={(e) =>
                setForm({ ...form, donorName: e.target.value })
              }
              placeholder="Rajesh Kumar"
            />
          </label>
          <label>
            Item name
            <input
              type="text"
              value={form.itemName}
              onChange={(e) =>
                setForm({ ...form, itemName: e.target.value })
              }
              placeholder="Rice bags, blankets..."
            />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option>Food</option>
              <option>Clothing</option>
              <option>Shelter Supplies</option>
              <option>Medical</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Condition
            <select
              value={form.condition}
              onChange={(e) =>
                setForm({ ...form, condition: e.target.value })
              }
            >
              <option>New</option>
              <option>Gently used</option>
            </select>
          </label>
          <label>
            Attach to drive (optional)
            <select
              value={form.driveId}
              onChange={(e) =>
                setForm({ ...form, driveId: e.target.value })
              }
            >
              <option value="">General pool</option>
              {drives.map((drive) => (
                <option key={drive.id} value={drive.id}>
                  {drive.name} ({drive.location})
                </option>
              ))}
            </select>
          </label>
          <label className="full-width">
            Notes
            <textarea
              rows="2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any timing constraints or special instructions."
            />
          </label>

          <button type="submit" className="primary-button">
            List donation
          </button>
        </form>
      </section>

      <section className="section">
        <h3>Your Donations</h3>
        {donations.length === 0 ? (
          <p className="empty-state">
            No donations yet. Use the form above to get started.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Drive</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => {
                  const drive =
                    donation.driveId &&
                    drives.find((d) => String(d.id) === String(donation.driveId))
                  return (
                    <tr key={donation.id}>
                      <td>{donation.donorName}</td>
                      <td>{donation.itemName}</td>
                      <td>{donation.category}</td>
                      <td>{donation.quantity}</td>
                      <td>{drive ? drive.name : 'General pool'}</td>
                      <td>{donation.status}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function RecipientView({ requests, onAddRequest }) {
  const [form, setForm] = useState({
    recipientName: '',
    familySize: 1,
    itemNeeded: '',
    category: 'Food',
    quantity: 1,
    urgency: 'Normal',
    location: '',
    feedback: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.recipientName || !form.itemNeeded || !form.location) return

    onAddRequest({
      id: Date.now(),
      ...form,
      status: 'Pending match',
    })

    setForm({
      recipientName: '',
      familySize: 1,
      itemNeeded: '',
      category: 'Food',
      quantity: 1,
      urgency: 'Normal',
      location: '',
      feedback: '',
    })
  }

  return (
    <div className="panel">
      <h2>Recipient Portal</h2>
      <p className="panel-description">
        Request the essentials you need and track delivery status.
      </p>

      <section className="section">
        <h3>New Request</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Your name / Organization
            <input
              type="text"
              value={form.recipientName}
              onChange={(e) =>
                setForm({ ...form, recipientName: e.target.value })
              }
              placeholder="Priya, local shelter..."
            />
          </label>
          <label>
            Family size / People impacted
            <input
              type="number"
              min="1"
              value={form.familySize}
              onChange={(e) =>
                setForm({ ...form, familySize: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Item needed
            <input
              type="text"
              value={form.itemNeeded}
              onChange={(e) =>
                setForm({ ...form, itemNeeded: e.target.value })
              }
              placeholder="Dry food kits, warm clothes..."
            />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option>Food</option>
              <option>Clothing</option>
              <option>Shelter Supplies</option>
              <option>Medical</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Urgency
            <select
              value={form.urgency}
              onChange={(e) =>
                setForm({ ...form, urgency: e.target.value })
              }
            >
              <option>Normal</option>
              <option>Urgent</option>
              <option>Emergency</option>
            </select>
          </label>
          <label>
            Delivery location
            <input
              type="text"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
              placeholder="Address / relief camp location"
            />
          </label>
          <label className="full-width">
            Feedback / Additional details (optional)
            <textarea
              rows="2"
              value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              placeholder="Any medical conditions, vulnerable people, accessibility needs..."
            />
          </label>

          <button type="submit" className="primary-button">
            Submit request
          </button>
        </form>
      </section>

      <section className="section">
        <h3>Your Requests</h3>
        {requests.length === 0 ? (
          <p className="empty-state">
            No requests yet. Use the form above to submit one.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Urgency</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.recipientName}</td>
                    <td>{request.itemNeeded}</td>
                    <td>{request.category}</td>
                    <td>{request.quantity}</td>
                    <td>{request.urgency}</td>
                    <td>{request.location}</td>
                    <td>{request.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function LogisticsView({
  drives,
  donations,
  requests,
  logisticsTasks,
  onAddTask,
  onUpdateTaskStatus,
}) {
  const [form, setForm] = useState({
    taskType: 'Pickup',
    relatedType: 'Donation',
    relatedId: '',
    vehicleNumber: '',
    coordinatorName: '',
    eta: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.coordinatorName || !form.vehicleNumber || !form.relatedId) return

    onAddTask({
      id: Date.now(),
      ...form,
      status: 'Scheduled',
    })

    setForm({
      taskType: 'Pickup',
      relatedType: 'Donation',
      relatedId: '',
      vehicleNumber: '',
      coordinatorName: '',
      eta: '',
    })
  }

  const relatedOptions =
    form.relatedType === 'Donation' ? donations : requests

  return (
    <div className="panel">
      <h2>Logistics Coordination</h2>
      <p className="panel-description">
        Organize transportation, manage inventory movement, and ensure on-time
        deliveries.
      </p>

      <div className="stats-grid">
        <StatCard label="Open Logistics Tasks" value={logisticsTasks.length} />
        <StatCard label="Donations" value={donations.length} />
        <StatCard label="Requests" value={requests.length} />
      </div>

      <section className="section">
        <h3>Schedule Transport</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Task type
            <select
              value={form.taskType}
              onChange={(e) =>
                setForm({ ...form, taskType: e.target.value })
              }
            >
              <option>Pickup</option>
              <option>Delivery</option>
              <option>Transfer</option>
            </select>
          </label>
          <label>
            Link to
            <select
              value={form.relatedType}
              onChange={(e) =>
                setForm({ ...form, relatedType: e.target.value, relatedId: '' })
              }
            >
              <option>Donation</option>
              <option>Request</option>
            </select>
          </label>
          <label>
            Select record
            <select
              value={form.relatedId}
              onChange={(e) =>
                setForm({ ...form, relatedId: e.target.value })
              }
            >
              <option value="">Choose...</option>
              {relatedOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {form.relatedType === 'Donation'
                    ? `${item.itemName} from ${item.donorName}`
                    : `${item.itemNeeded} for ${item.recipientName}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Vehicle number
            <input
              type="text"
              value={form.vehicleNumber}
              onChange={(e) =>
                setForm({ ...form, vehicleNumber: e.target.value })
              }
              placeholder="TN 01 AB 1234"
            />
          </label>
          <label>
            Coordinator name
            <input
              type="text"
              value={form.coordinatorName}
              onChange={(e) =>
                setForm({ ...form, coordinatorName: e.target.value })
              }
              placeholder="Logistics volunteer name"
            />
          </label>
          <label>
            ETA
            <input
              type="datetime-local"
              value={form.eta}
              onChange={(e) => setForm({ ...form, eta: e.target.value })}
            />
          </label>

          <button type="submit" className="primary-button">
            Create logistics task
          </button>
        </form>
      </section>

      <section className="section">
        <h3>Logistics Tasks</h3>
        {logisticsTasks.length === 0 ? (
          <p className="empty-state">
            No logistics tasks yet. Schedule one using the form above.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Linked to</th>
                  <th>Vehicle</th>
                  <th>Coordinator</th>
                  <th>ETA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logisticsTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.taskType}</td>
                    <td>
                      {task.relatedType}{' '}
                      {task.relatedType === 'Donation'
                        ? `#${task.relatedId}`
                        : `#${task.relatedId}`}
                    </td>
                    <td>{task.vehicleNumber}</td>
                    <td>{task.coordinatorName}</td>
                    <td>{task.eta || '-'}</td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          onUpdateTaskStatus(task.id, e.target.value)
                        }
                      >
                        <option>Scheduled</option>
                        <option>In transit</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default App
