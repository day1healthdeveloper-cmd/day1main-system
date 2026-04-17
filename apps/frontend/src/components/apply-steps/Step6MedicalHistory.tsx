/**
 * Step 4 of 6: Medical History
 * 
 * Collects comprehensive medical history information for underwriting purposes.
 * - Chronic medication
 * - Medical conditions treatment
 * - Dental conditions
 * - Future medical concerns
 * - Major operations (past 5 years)
 * - Hospital admissions (past 5 years)
 * - Previous Medical Aid membership
 * 
 * Part of Day1Health 6-step application flow
 */

'use client'

import { useState } from 'react'
import { ApplicationData } from '@/types/application'

interface MedicalEntry {
  person: string
  condition: string
  medication: string
}

interface OperationEntry {
  person: string
  procedure: string
  date: string
}

interface HospitalEntry {
  person: string
  reason: string
  date: string
}

interface MedicalAidEntry {
  person: string
  schemeName: string
  inceptionDate: string
}

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
  prevStep: () => void
}

export default function Step6MedicalHistory({ data, updateData, nextStep, prevStep }: Props) {
  // Get list of people (main member + dependants)
  const people = [
    'Main Member',
    ...(data.dependents || []).map(d => `${d.firstName} ${d.lastName}`)
  ]

  const [chronicMedication, setChronicMedication] = useState<'yes' | 'no' | ''>('')
  const [chronicEntries, setChronicEntries] = useState<MedicalEntry[]>([])
  const [showChronicForm, setShowChronicForm] = useState(false)
  const [chronicForm, setChronicForm] = useState<MedicalEntry>({ person: '', condition: '', medication: '' })

  const [otherTreatment, setOtherTreatment] = useState<'yes' | 'no' | ''>('')
  const [otherEntries, setOtherEntries] = useState<MedicalEntry[]>([])
  const [showOtherForm, setShowOtherForm] = useState(false)
  const [otherForm, setOtherForm] = useState<MedicalEntry>({ person: '', condition: '', medication: '' })

  const [dentalTreatment, setDentalTreatment] = useState<'yes' | 'no' | ''>('')
  const [dentalEntries, setDentalEntries] = useState<MedicalEntry[]>([])
  const [showDentalForm, setShowDentalForm] = useState(false)
  const [dentalForm, setDentalForm] = useState<MedicalEntry>({ person: '', condition: '', medication: '' })

  const [futureConcerns, setFutureConcerns] = useState<'yes' | 'no' | ''>('')
  const [futureEntries, setFutureEntries] = useState<MedicalEntry[]>([])
  const [showFutureForm, setShowFutureForm] = useState(false)
  const [futureForm, setFutureForm] = useState<MedicalEntry>({ person: '', condition: '', medication: '' })

  const [pregnancy, setPregnancy] = useState<'yes' | 'no' | ''>('')
  const [pregnancyEntries, setPregnancyEntries] = useState<Array<{ person: string; dueDate: string }>>([])
  const [showPregnancyForm, setShowPregnancyForm] = useState(false)
  const [pregnancyForm, setPregnancyForm] = useState<{ person: string; dueDate: string }>({ person: '', dueDate: '' })

  const [majorOperations, setMajorOperations] = useState<'yes' | 'no' | ''>('')
  const [operationEntries, setOperationEntries] = useState<OperationEntry[]>([])
  const [showOperationForm, setShowOperationForm] = useState(false)
  const [operationForm, setOperationForm] = useState<OperationEntry>({ person: '', procedure: '', date: '' })

  const [hospitalAdmissions, setHospitalAdmissions] = useState<'yes' | 'no' | ''>('')
  const [hospitalEntries, setHospitalEntries] = useState<HospitalEntry[]>([])
  const [showHospitalForm, setShowHospitalForm] = useState(false)
  const [hospitalForm, setHospitalForm] = useState<HospitalEntry>({ person: '', reason: '', date: '' })

  const [medicalAidMember, setMedicalAidMember] = useState<'yes' | 'no' | ''>('')
  const [medicalAidEntries, setMedicalAidEntries] = useState<MedicalAidEntry[]>([])
  const [showMedicalAidForm, setShowMedicalAidForm] = useState(false)
  const [medicalAidForm, setMedicalAidForm] = useState<MedicalAidEntry>({ person: '', schemeName: '', inceptionDate: '' })

  const handleNext = () => {
    // Validate all questions are answered
    if (!chronicMedication) {
      alert('Please answer the chronic medication question')
      return
    }
    if (!otherTreatment) {
      alert('Please answer the other medical treatment question')
      return
    }
    if (!dentalTreatment) {
      alert('Please answer the dental treatment question')
      return
    }
    if (!futureConcerns) {
      alert('Please answer the future medical concerns question')
      return
    }
    if (!pregnancy) {
      alert('Please answer the pregnancy question')
      return
    }
    if (!majorOperations) {
      alert('Please answer the major operations question')
      return
    }
    if (!hospitalAdmissions) {
      alert('Please answer the hospital admissions question')
      return
    }
    if (!medicalAidMember) {
      alert('Please answer the medical aid membership question')
      return
    }

    updateData({ 
      medicalHistory: {
        chronicMedication,
        chronicEntries,
        otherTreatment,
        otherEntries,
        dentalTreatment,
        dentalEntries,
        futureConcerns,
        futureEntries,
        pregnancy,
        pregnancyEntries,
        majorOperations,
        operationEntries,
        hospitalAdmissions,
        hospitalEntries,
        medicalAidMember,
        medicalAidEntries
      }
    })
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Medical History</h2>
      <p className="text-xs text-gray-600 mb-3">Please answer the following questions honestly</p>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {/* 1. Chronic Medication */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Are you or any of your dependants on any form of chronic medication?</p>
          <div className="flex gap-3 mb-2">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={chronicMedication === 'yes'}
                onChange={() => {
                  setChronicMedication('yes')
                  setShowChronicForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={chronicMedication === 'no'}
                onChange={() => {
                  setChronicMedication('no')
                  setChronicEntries([])
                  setShowChronicForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {chronicMedication === 'yes' && (
            <div className="space-y-2">
              {chronicEntries.map((entry, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>Person:</strong> {entry.person}</p>
                      <p><strong>Condition:</strong> {entry.condition}</p>
                      <p><strong>Medication:</strong> {entry.medication}</p>
                    </div>
                    <button
                      onClick={() => setChronicEntries(chronicEntries.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!showChronicForm && (
                <button
                  onClick={() => setShowChronicForm(true)}
                  className="w-full px-3 py-1.5 text-xs border-2 border-dashed border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  + Add Entry
                </button>
              )}

              {showChronicForm && (
                <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Person</label>
                    <select
                      value={chronicForm.person}
                      onChange={(e) => setChronicForm({ ...chronicForm, person: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select person</option>
                      {people.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Condition</label>
                    <input
                      type="text"
                      value={chronicForm.condition}
                      onChange={(e) => setChronicForm({ ...chronicForm, condition: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Medication</label>
                    <input
                      type="text"
                      value={chronicForm.medication}
                      onChange={(e) => setChronicForm({ ...chronicForm, medication: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (chronicForm.person || chronicForm.condition || chronicForm.medication) {
                          setChronicEntries([...chronicEntries, chronicForm])
                          setChronicForm({ person: '', condition: '', medication: '' })
                          setShowChronicForm(false)
                        }
                      }}
                      className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowChronicForm(false)
                        setChronicForm({ person: '', condition: '', medication: '' })
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Other Medical Treatment */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Are you or any of your dependants receiving treatment for any other medical condition other than a chronic condition?</p>
          <div className="flex gap-3 mb-2">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={otherTreatment === 'yes'}
                onChange={() => {
                  setOtherTreatment('yes')
                  setShowOtherForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={otherTreatment === 'no'}
                onChange={() => {
                  setOtherTreatment('no')
                  setOtherEntries([])
                  setShowOtherForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {otherTreatment === 'yes' && (
            <div className="space-y-2">
              {otherEntries.map((entry, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>Person:</strong> {entry.person}</p>
                      <p><strong>Condition:</strong> {entry.condition}</p>
                      <p><strong>Medication:</strong> {entry.medication}</p>
                    </div>
                    <button
                      onClick={() => setOtherEntries(otherEntries.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!showOtherForm && (
                <button
                  onClick={() => setShowOtherForm(true)}
                  className="w-full px-3 py-1.5 text-xs border-2 border-dashed border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  + Add Entry
                </button>
              )}

              {showOtherForm && (
                <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Person</label>
                    <select
                      value={otherForm.person}
                      onChange={(e) => setOtherForm({ ...otherForm, person: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select person</option>
                      {people.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Condition</label>
                    <input
                      type="text"
                      value={otherForm.condition}
                      onChange={(e) => setOtherForm({ ...otherForm, condition: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Medication</label>
                    <input
                      type="text"
                      value={otherForm.medication}
                      onChange={(e) => setOtherForm({ ...otherForm, medication: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (otherForm.person || otherForm.condition || otherForm.medication) {
                          setOtherEntries([...otherEntries, otherForm])
                          setOtherForm({ person: '', condition: '', medication: '' })
                          setShowOtherForm(false)
                        }
                      }}
                      className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowOtherForm(false)
                        setOtherForm({ person: '', condition: '', medication: '' })
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Dental Treatment */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Are you or any of your dependants receiving treatment for any dental condition?</p>
          <div className="flex gap-3 mb-2">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={dentalTreatment === 'yes'}
                onChange={() => {
                  setDentalTreatment('yes')
                  setShowDentalForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={dentalTreatment === 'no'}
                onChange={() => {
                  setDentalTreatment('no')
                  setDentalEntries([])
                  setShowDentalForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {dentalTreatment === 'yes' && (
            <div className="space-y-2">
              {dentalEntries.map((entry, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>Person:</strong> {entry.person}</p>
                      <p><strong>Condition:</strong> {entry.condition}</p>
                      <p><strong>Medication:</strong> {entry.medication}</p>
                    </div>
                    <button
                      onClick={() => setDentalEntries(dentalEntries.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!showDentalForm && (
                <button
                  onClick={() => setShowDentalForm(true)}
                  className="w-full px-3 py-1.5 text-xs border-2 border-dashed border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  + Add Entry
                </button>
              )}

              {showDentalForm && (
                <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Person</label>
                    <select
                      value={dentalForm.person}
                      onChange={(e) => setDentalForm({ ...dentalForm, person: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select person</option>
                      {people.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Condition</label>
                    <input
                      type="text"
                      value={dentalForm.condition}
                      onChange={(e) => setDentalForm({ ...dentalForm, condition: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Medication</label>
                    <input
                      type="text"
                      value={dentalForm.medication}
                      onChange={(e) => setDentalForm({ ...dentalForm, medication: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (dentalForm.person || dentalForm.condition || dentalForm.medication) {
                          setDentalEntries([...dentalEntries, dentalForm])
                          setDentalForm({ person: '', condition: '', medication: '' })
                          setShowDentalForm(false)
                        }
                      }}
                      className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowDentalForm(false)
                        setDentalForm({ person: '', condition: '', medication: '' })
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Future Concerns */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Are you or any of your dependants concerned about any other current condition which may require medical or dental attention in the future?</p>
          <div className="flex gap-3 mb-2">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={futureConcerns === 'yes'}
                onChange={() => {
                  setFutureConcerns('yes')
                  setShowFutureForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={futureConcerns === 'no'}
                onChange={() => {
                  setFutureConcerns('no')
                  setFutureEntries([])
                  setShowFutureForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {futureConcerns === 'yes' && (
            <div className="space-y-2">
              {futureEntries.map((entry, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>Person:</strong> {entry.person}</p>
                      <p><strong>Condition:</strong> {entry.condition}</p>
                      <p><strong>Medication:</strong> {entry.medication}</p>
                    </div>
                    <button
                      onClick={() => setFutureEntries(futureEntries.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!showFutureForm && (
                <button
                  onClick={() => setShowFutureForm(true)}
                  className="w-full px-3 py-1.5 text-xs border-2 border-dashed border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  + Add Entry
                </button>
              )}

              {showFutureForm && (
                <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Person</label>
                    <select
                      value={futureForm.person}
                      onChange={(e) => setFutureForm({ ...futureForm, person: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select person</option>
                      {people.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Condition</label>
                    <input
                      type="text"
                      value={futureForm.condition}
                      onChange={(e) => setFutureForm({ ...futureForm, condition: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Medication</label>
                    <input
                      type="text"
                      value={futureForm.medication}
                      onChange={(e) => setFutureForm({ ...futureForm, medication: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (futureForm.person || futureForm.condition || futureForm.medication) {
                          setFutureEntries([...futureEntries, futureForm])
                          setFutureForm({ person: '', condition: '', medication: '' })
                          setShowFutureForm(false)
                        }
                      }}
                      className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowFutureForm(false)
                        setFutureForm({ person: '', condition: '', medication: '' })
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Pregnancy */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Are you or any of your dependants pregnant?</p>
          <div className="flex gap-3 mb-2">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={pregnancy === 'yes'}
                onChange={() => {
                  setPregnancy('yes')
                  setShowPregnancyForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={pregnancy === 'no'}
                onChange={() => {
                  setPregnancy('no')
                  setPregnancyEntries([])
                  setShowPregnancyForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {pregnancy === 'yes' && (
            <div className="space-y-2">
              {pregnancyEntries.map((entry, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>Person:</strong> {entry.person}</p>
                      <p><strong>Due Date:</strong> {entry.dueDate}</p>
                    </div>
                    <button
                      onClick={() => setPregnancyEntries(pregnancyEntries.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!showPregnancyForm && (
                <button
                  onClick={() => setShowPregnancyForm(true)}
                  className="w-full px-3 py-1.5 text-xs border-2 border-dashed border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  + Add Entry
                </button>
              )}

              {showPregnancyForm && (
                <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Person</label>
                    <select
                      value={pregnancyForm.person}
                      onChange={(e) => setPregnancyForm({ ...pregnancyForm, person: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select person</option>
                      {people.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Expected Due Date</label>
                    <input
                      type="date"
                      value={pregnancyForm.dueDate}
                      onChange={(e) => setPregnancyForm({ ...pregnancyForm, dueDate: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (pregnancyForm.person || pregnancyForm.dueDate) {
                          setPregnancyEntries([...pregnancyEntries, pregnancyForm])
                          setPregnancyForm({ person: '', dueDate: '' })
                          setShowPregnancyForm(false)
                        }
                      }}
                      className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowPregnancyForm(false)
                        setPregnancyForm({ person: '', dueDate: '' })
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. Major Operations */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Have you or any of your dependants undergone any major operations in the past 5 years?</p>
          <div className="flex gap-3 mb-2">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={majorOperations === 'yes'}
                onChange={() => {
                  setMajorOperations('yes')
                  setShowOperationForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={majorOperations === 'no'}
                onChange={() => {
                  setMajorOperations('no')
                  setOperationEntries([])
                  setShowOperationForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {majorOperations === 'yes' && (
            <div className="space-y-2">
              {operationEntries.map((entry, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>Person:</strong> {entry.person}</p>
                      <p><strong>Procedure:</strong> {entry.procedure}</p>
                      <p><strong>Date:</strong> {entry.date}</p>
                    </div>
                    <button
                      onClick={() => setOperationEntries(operationEntries.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!showOperationForm && (
                <button
                  onClick={() => setShowOperationForm(true)}
                  className="w-full px-3 py-1.5 text-xs border-2 border-dashed border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  + Add Entry
                </button>
              )}

              {showOperationForm && (
                <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Person</label>
                    <select
                      value={operationForm.person}
                      onChange={(e) => setOperationForm({ ...operationForm, person: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select person</option>
                      {people.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Procedure</label>
                    <input
                      type="text"
                      value={operationForm.procedure}
                      onChange={(e) => setOperationForm({ ...operationForm, procedure: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Date of Procedure</label>
                    <input
                      type="date"
                      value={operationForm.date}
                      onChange={(e) => setOperationForm({ ...operationForm, date: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (operationForm.person || operationForm.procedure || operationForm.date) {
                          setOperationEntries([...operationEntries, operationForm])
                          setOperationForm({ person: '', procedure: '', date: '' })
                          setShowOperationForm(false)
                        }
                      }}
                      className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowOperationForm(false)
                        setOperationForm({ person: '', procedure: '', date: '' })
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. Hospital Admissions */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Have you or any of your dependants been admitted into hospital in the past 5 years?</p>
          <div className="flex gap-3 mb-2">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={hospitalAdmissions === 'yes'}
                onChange={() => {
                  setHospitalAdmissions('yes')
                  setShowHospitalForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={hospitalAdmissions === 'no'}
                onChange={() => {
                  setHospitalAdmissions('no')
                  setHospitalEntries([])
                  setShowHospitalForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {hospitalAdmissions === 'yes' && (
            <div className="space-y-2">
              {hospitalEntries.map((entry, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>Person:</strong> {entry.person}</p>
                      <p><strong>Reason:</strong> {entry.reason}</p>
                      <p><strong>Date:</strong> {entry.date}</p>
                    </div>
                    <button
                      onClick={() => setHospitalEntries(hospitalEntries.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!showHospitalForm && (
                <button
                  onClick={() => setShowHospitalForm(true)}
                  className="w-full px-3 py-1.5 text-xs border-2 border-dashed border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  + Add Entry
                </button>
              )}

              {showHospitalForm && (
                <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Person</label>
                    <select
                      value={hospitalForm.person}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, person: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select person</option>
                      {people.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Reason for Admission</label>
                    <input
                      type="text"
                      value={hospitalForm.reason}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, reason: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Date of Admission</label>
                    <input
                      type="date"
                      value={hospitalForm.date}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, date: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (hospitalForm.person || hospitalForm.reason || hospitalForm.date) {
                          setHospitalEntries([...hospitalEntries, hospitalForm])
                          setHospitalForm({ person: '', reason: '', date: '' })
                          setShowHospitalForm(false)
                        }
                      }}
                      className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowHospitalForm(false)
                        setHospitalForm({ person: '', reason: '', date: '' })
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 7. Medical Aid Membership */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Are you or your spouse/partner a member of a Medical Aid scheme or hospital plan?</p>
          <div className="flex gap-3 mb-2">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={medicalAidMember === 'yes'}
                onChange={() => {
                  setMedicalAidMember('yes')
                  setShowMedicalAidForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={medicalAidMember === 'no'}
                onChange={() => {
                  setMedicalAidMember('no')
                  setMedicalAidEntries([])
                  setShowMedicalAidForm(false)
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">No</span>
            </label>
          </div>

          {medicalAidMember === 'yes' && (
            <div className="space-y-2">
              {medicalAidEntries.map((entry, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>Person:</strong> {entry.person}</p>
                      <p><strong>Scheme/Plan:</strong> {entry.schemeName}</p>
                      <p><strong>Inception Date:</strong> {entry.inceptionDate}</p>
                    </div>
                    <button
                      onClick={() => setMedicalAidEntries(medicalAidEntries.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!showMedicalAidForm && (
                <button
                  onClick={() => setShowMedicalAidForm(true)}
                  className="w-full px-3 py-1.5 text-xs border-2 border-dashed border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  + Add Entry
                </button>
              )}

              {showMedicalAidForm && (
                <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Person</label>
                    <select
                      value={medicalAidForm.person}
                      onChange={(e) => setMedicalAidForm({ ...medicalAidForm, person: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select person</option>
                      {people.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Name of Scheme/Plan</label>
                    <input
                      type="text"
                      value={medicalAidForm.schemeName}
                      onChange={(e) => setMedicalAidForm({ ...medicalAidForm, schemeName: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Date of Inception</label>
                    <input
                      type="date"
                      value={medicalAidForm.inceptionDate}
                      onChange={(e) => setMedicalAidForm({ ...medicalAidForm, inceptionDate: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (medicalAidForm.person || medicalAidForm.schemeName || medicalAidForm.inceptionDate) {
                          setMedicalAidEntries([...medicalAidEntries, medicalAidForm])
                          setMedicalAidForm({ person: '', schemeName: '', inceptionDate: '' })
                          setShowMedicalAidForm(false)
                        }
                      }}
                      className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowMedicalAidForm(false)
                        setMedicalAidForm({ person: '', schemeName: '', inceptionDate: '' })
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-3 pb-10">
        <button
          onClick={prevStep}
          className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
        >
          Next: Banking Details
        </button>
      </div>
    </div>
  )
}
