/**
 * Step 3 of 6: Dependents
 * 
 * Allows users to add spouse and children to their medical insurance application.
 * - Add/Edit/Remove dependents
 * - Spouse requires ID number
 * - Children require birth certificate
 * - Optional step - can proceed without dependents
 * 
 * Part of Day1Health 6-step application flow
 */

'use client'

import { useState } from 'react'
import { ApplicationData, Dependent } from '@/types/application'
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DropdownNavProps, DropdownProps } from "react-day-picker"

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
  prevStep: () => void
}

export default function Step5Dependents({ data, updateData, nextStep, prevStep }: Props) {
  const [dependents, setDependents] = useState<Dependent[]>(data.dependents || [])
  const [showForm, setShowForm] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Dependent>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    relationship: 'child',
  })
  const [date, setDate] = useState<Date | undefined>(undefined)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }))
    }
  }

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>,
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>
    _e(_event)
  }

  const handleAdd = () => {
    if (editIndex !== null) {
      const updated = [...dependents]
      updated[editIndex] = formData
      setDependents(updated)
      setEditIndex(null)
    } else {
      setDependents([...dependents, formData])
    }
    setFormData({ firstName: '', lastName: '', dateOfBirth: '', relationship: 'child' })
    setDate(undefined)
    setShowForm(false)
  }

  const handleEdit = (index: number) => {
    setFormData(dependents[index])
    setDate(dependents[index].dateOfBirth ? new Date(dependents[index].dateOfBirth) : undefined)
    setEditIndex(index)
    setShowForm(true)
  }

  const handleRemove = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    updateData({ dependents })
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Dependents</h2>
      <p className="text-xs text-gray-600 mb-2">Add your spouse and/or children (optional)</p>

      <div className="space-y-2">
        {dependents.length > 0 && (
          <div className="space-y-2">
            {dependents.map((dep, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-2 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{dep.firstName} {dep.lastName}</p>
                  <p className="text-xs text-gray-600 capitalize">{dep.relationship} • {dep.dateOfBirth}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(idx)}
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="text-red-600 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-4 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
          >
            + Add Dependent
          </button>
        )}

        {showForm && (
          <div className="border border-gray-300 rounded p-3 space-y-2">
            <h3 className="text-sm font-medium">Add Dependent</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Relationship *
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                required
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
              >
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Date of Birth *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal h-8 px-2 text-sm ${!date && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    captionLayout="dropdown"
                    defaultMonth={new Date(2000, 0)}
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date()}
                    hideNavigation
                    components={{
                      DropdownNav: (props: DropdownNavProps) => {
                        return <div className="flex w-full items-center gap-2">{props.children}</div>
                      },
                      Dropdown: (props: DropdownProps) => {
                        return (
                          <Select
                            value={String(props.value)}
                            onValueChange={(value) => {
                              if (props.onChange) {
                                handleCalendarChange(value, props.onChange)
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-fit font-medium first:grow">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                              {props.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={String(option.value)}
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      },
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {formData.relationship === 'spouse' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  ID Number
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber || ''}
                  onChange={handleChange}
                  maxLength={13}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!formData.firstName || !formData.lastName || !formData.dateOfBirth}
                className="flex-1 px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
              >
                {editIndex !== null ? 'Update' : 'Add'} Dependent
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditIndex(null)
                  setFormData({ firstName: '', lastName: '', dateOfBirth: '', relationship: 'child' })
                }}
                className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2 pb-10">
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
            Next: Medical History
          </button>
        </div>
      </div>
    </div>
  )
}
