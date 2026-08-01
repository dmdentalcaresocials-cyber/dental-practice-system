'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  phone: string
  created_at: string
}

interface Treatment {
  id: string
  patient_id: string
  treatment_date: string
  revenue_lei: number
  created_at: string
}

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [newPatient, setNewPatient] = useState({ first_name: '', last_name: '', phone: '' })
  const [newTreatment, setNewTreatment] = useState({ patient_id: '', revenue_lei: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: patientsData } = await supabase.from('patients').select('*').limit(100)
      const { data: treatmentsData } = await supabase.from('treatments').select('*').limit(100)
      
      setPatients(patientsData || [])
      setTreatments(treatmentsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('patients').insert([
        {
          patient_id: `P${Date.now()}`,
          first_name: newPatient.first_name,
          last_name: newPatient.last_name,
          phone: newPatient.phone,
          is_active: true
        }
      ])
      
      if (!error) {
        setNewPatient({ first_name: '', last_name: '', phone: '' })
        fetchData()
        alert('Patient added successfully!')
      }
    } catch (error) {
      alert('Error adding patient')
    }
  }

  const addTreatment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('treatments').insert([
        {
          patient_id: newTreatment.patient_id,
          procedure_id: '00000000-0000-0000-0000-000000000001',
          dentist_id: '00000000-0000-0000-0000-000000000001',
          treatment_date: new Date().toISOString().split('T')[0],
          revenue_lei: parseFloat(newTreatment.revenue_lei),
          is_completed: true
        }
      ])
      
      if (!error) {
        setNewTreatment({ patient_id: '', revenue_lei: '' })
        fetchData()
        alert('Treatment logged successfully!')
      }
    } catch (error) {
      alert('Error logging treatment')
    }
  }

  const todayRevenue = treatments
    .filter(t => t.treatment_date === new Date().toISOString().split('T')[0])
    .reduce((sum, t) => sum + t.revenue_lei, 0)

  return (
    <div className="container">
      <header>
        <h1>🦷 Dental Practice System</h1>
        <p>Manage patients, treatments, and track revenue in real-time</p>
      </header>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button 
          className={activeTab === 'dashboard' ? 'btn-primary' : ''} 
          onClick={() => setActiveTab('dashboard')}
          style={{ backgroundColor: activeTab === 'dashboard' ? '#2563eb' : '#e2e8f0', color: activeTab === 'dashboard' ? 'white' : 'black' }}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'patients' ? 'btn-primary' : ''} 
          onClick={() => setActiveTab('patients')}
          style={{ backgroundColor: activeTab === 'patients' ? '#2563eb' : '#e2e8f0', color: activeTab === 'patients' ? 'white' : 'black' }}
        >
          Patients
        </button>
        <button 
          className={activeTab === 'treatments' ? 'btn-primary' : ''} 
          onClick={() => setActiveTab('treatments')}
          style={{ backgroundColor: activeTab === 'treatments' ? '#2563eb' : '#e2e8f0', color: activeTab === 'treatments' ? 'white' : 'black' }}
        >
          Treatments
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div>
              <h2>Today's Overview</h2>
              <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <p style={{ color: '#64748b', marginBottom: '5px' }}>Patients Treated Today</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>
                      {treatments.filter(t => t.treatment_date === new Date().toISOString().split('T')[0]).length}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#64748b', marginBottom: '5px' }}>Revenue Today</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{todayRevenue.toFixed(2)} lei</p>
                  </div>
                  <div>
                    <p style={{ color: '#64748b', marginBottom: '5px' }}>Total Patients</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{patients.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div>
              <h2>Add New Patient</h2>
              <form onSubmit={addPatient} className="card">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newPatient.first_name}
                  onChange={(e) => setNewPatient({ ...newPatient, first_name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newPatient.last_name}
                  onChange={(e) => setNewPatient({ ...newPatient, last_name: e.target.value })}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary">Add Patient</button>
              </form>

              <h2>Patients List</h2>
              <div className="card">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id}>
                        <td>{p.patient_id}</td>
                        <td>{p.first_name} {p.last_name}</td>
                        <td>{p.phone}</td>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'treatments' && (
            <div>
              <h2>Log New Treatment</h2>
              <form onSubmit={addTreatment} className="card">
                <select
                  value={newTreatment.patient_id}
                  onChange={(e) => setNewTreatment({ ...newTreatment, patient_id: e.target.value })}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Revenue (lei)"
                  value={newTreatment.revenue_lei}
                  onChange={(e) => setNewTreatment({ ...newTreatment, revenue_lei: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary">Log Treatment</button>
              </form>

              <h2>Recent Treatments</h2>
              <div className="card">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Revenue (lei)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatments.slice(0, 10).map(t => {
                      const patient = patients.find(p => p.id === t.patient_id)
                      return (
                        <tr key={t.id}>
                          <td>{new Date(t.treatment_date).toLocaleDateString()}</td>
                          <td>{patient?.first_name} {patient?.last_name}</td>
                          <td>{t.revenue_lei.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
