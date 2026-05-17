'use client'

import { useState } from 'react'

interface GoalFormProps {
  onSubmit: (goal: any) => void
}

export default function GoalForm({ onSubmit }: GoalFormProps) {
  const [formData, setFormData] = useState({
    thrustArea: '',
    title: '',
    description: '',
    uom: 'NUMERIC',
    target: '',
    weightage: '10',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.thrustArea.trim() || !formData.title.trim()) {
      alert('Thrust Area and Title are required')
      return
    }

    const weightage = parseFloat(formData.weightage)
    if (weightage < 10 || weightage > 100) {
      alert('Weightage must be between 10% and 100%')
      return
    }

    const target = formData.target ? parseFloat(formData.target) : null
    if (formData.uom !== 'ZERO' && !target) {
      alert('Target is required for this UoM type')
      return
    }

    onSubmit({
      thrustArea: formData.thrustArea,
      title: formData.title,
      description: formData.description,
      uom: formData.uom,
      target: target,
      weightage: weightage,
      status: 'NOT_STARTED',
    })

    // Reset form
    setFormData({
      thrustArea: '',
      title: '',
      description: '',
      uom: 'NUMERIC',
      target: '',
      weightage: '10',
    })
  }

  return (
    <div className="card mb-6">
      <div className="card-header">Add New Goal</div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Thrust Area *</label>
            <input
              type="text"
              name="thrustArea"
              value={formData.thrustArea}
              onChange={handleChange}
              placeholder="e.g., Sales, Operations, Innovation"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Increase Revenue by Q2"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional: Add details about this goal"
            className="form-textarea"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label">Unit of Measurement *</label>
            <select
              name="uom"
              value={formData.uom}
              onChange={handleChange}
              className="form-select"
            >
              <option value="NUMERIC">Numeric (e.g., 100 units)</option>
              <option value="PERCENTAGE">Percentage (e.g., 80%)</option>
              <option value="TIMELINE">Timeline (e.g., Date)</option>
              <option value="ZERO">Zero-based (e.g., Safety incidents)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Value *</label>
            <input
              type="number"
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="e.g., 100"
              className="form-input"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Weightage (%) *</label>
            <input
              type="number"
              name="weightage"
              value={formData.weightage}
              onChange={handleChange}
              placeholder="e.g., 20"
              className="form-input"
              min="10"
              max="100"
              step="1"
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button type="submit" className="btn-primary">
            Add Goal
          </button>
          <p className="text-xs text-gray-500 self-center">
            Total weightage across all goals must equal 100%
          </p>
        </div>
      </form>
    </div>
  )
}
