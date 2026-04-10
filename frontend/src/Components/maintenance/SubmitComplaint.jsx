// SubmitComplaint component - form for students to submit a new maintenance ticket
// Validates all fields, shows inline errors, previews uploaded images

import { useState } from 'react'

// Dropdown options for the category field
const categoryOptions = [
  { value: '', label: 'Select category...' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'network', label: 'Network' },
  { value: 'other', label: 'Other' },
]

// Radio options for priority
const priorityOptions = [
  { value: 'low', label: 'Low', color: 'peer-checked:border-[#101312] peer-checked:bg-[#101312]/5' },
  { value: 'medium', label: 'Medium', color: 'peer-checked:border-[#876DFF] peer-checked:bg-[#876DFF]/10' },
  { value: 'high', label: 'High', color: 'peer-checked:border-[#BAF91A] peer-checked:bg-[#BAF91A]/20' },
  { value: 'emergency', label: 'Emergency', color: 'peer-checked:border-[#876DFF] peer-checked:bg-[#876DFF]/15' },
]

// Hostel blocks A through F
const hostelBlocks = ['A', 'B', 'C', 'D', 'E', 'F']

// Shared Tailwind classes for inputs
// Using hardcoded colors because tailwind.config remaps slate/emerald to custom scales
const inputClasses = 'w-full rounded-xl border border-[#101312]/15 bg-white px-4 py-2.5 text-sm text-[#101312] placeholder-[#101312]/50 outline-none transition focus:border-[#876DFF] focus:ring-1 focus:ring-[#876DFF]/20'
const labelClasses = 'mb-1.5 block text-sm font-medium text-[#101312]'
const errorClasses = 'mt-1 text-xs text-[#e53e3e]'

// Max file constraints
const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

// Initial empty form state
const initialFormState = {
  title: '',
  category: '',
  priority: '',
  hostelBlock: '',
  roomNumber: '',
  description: '',
}

function SubmitComplaint({ onSubmit }) {
  // Form data
  const [form, setForm] = useState(initialFormState)

  // Uploaded files and their preview URLs
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])

  // Validation error messages (keyed by field name)
  const [errors, setErrors] = useState({})

  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')

  // Update a single form field
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear the error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Handle file upload with validation
  function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files)
    const newErrors = {}

    // Check total count
    if (files.length + selectedFiles.length > MAX_FILES) {
      newErrors.files = `You can upload a maximum of ${MAX_FILES} files.`
      setErrors((prev) => ({ ...prev, ...newErrors }))
      return
    }

    // Validate each file
    const validFiles = []
    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.files = 'Only JPG and PNG files are allowed.'
        break
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors.files = 'Each file must be under 5MB.'
        break
      }
      validFiles.push(file)
    }

    if (newErrors.files) {
      setErrors((prev) => ({ ...prev, ...newErrors }))
      return
    }

    // Create preview URLs for thumbnails
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f))

    setFiles((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
    setErrors((prev) => ({ ...prev, files: '' }))

    // Reset the file input so user can pick again
    e.target.value = ''
  }

  // Remove a file by index
  function removeFile(index) {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previews[index])
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Validate all fields and return true if valid
  function validate() {
    const newErrors = {}

    // Title: 5-100 characters
    if (!form.title.trim()) {
      newErrors.title = 'Title is required.'
    } else if (form.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters.'
    } else if (form.title.trim().length > 100) {
      newErrors.title = 'Title must be under 100 characters.'
    }

    // Category: must be selected
    if (!form.category) {
      newErrors.category = 'Please select a category.'
    }

    // Priority: must be selected
    if (!form.priority) {
      newErrors.priority = 'Please select a priority level.'
    }

    // Hostel block: must be selected
    if (!form.hostelBlock) {
      newErrors.hostelBlock = 'Please select your hostel block.'
    }

    // Room number: 3-4 digits
    if (!form.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required.'
    } else if (!/^\d{3,4}$/.test(form.roomNumber.trim())) {
      newErrors.roomNumber = 'Room number must be 3-4 digits.'
    }

    // Description: 20-500 characters
    if (!form.description.trim()) {
      newErrors.description = 'Description is required.'
    } else if (form.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters.'
    } else if (form.description.trim().length > 500) {
      newErrors.description = 'Description must be under 500 characters.'
    }

    setErrors(newErrors)
    // If no keys in newErrors, the form is valid
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    // Build the data object to send to the parent
    const formData = {
      ...form,
      title: form.title.trim(),
      roomNumber: form.roomNumber.trim(),
      description: form.description.trim(),
      files,
    }

    try {
      const result = await onSubmit(formData)
      // Generate a ticket ID from result or create a placeholder
      const id = result?.ticketId || `MT-${Date.now().toString(36).toUpperCase()}`
      setTicketId(id)
      setSubmitted(true)

      // Reset form
      setForm(initialFormState)
      setFiles([])
      // Revoke all preview URLs
      previews.forEach((url) => URL.revokeObjectURL(url))
      setPreviews([])
    } catch {
      setErrors((prev) => ({ ...prev, submit: 'Something went wrong. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---- Success screen shown after submission ----
  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#101312]/10 bg-white p-8 text-center">
        {/* Check icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
          ✓
        </div>
        <h2 className="text-xl font-semibold text-slate-950">Ticket Submitted!</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your maintenance request has been received. Track it using:
        </p>
        <p className="mt-2 font-mono text-lg text-emerald-600">{ticketId}</p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-[#BAF91A] px-6 py-2.5 text-sm font-medium text-[#101312] transition hover:bg-[#a9ea00]"
          onClick={() => setSubmitted(false)}
        >
          Submit Another Ticket
        </button>
      </div>
    )
  }

  // ---- Main form ----
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Submit Maintenance Request</h2>
        <p className="mt-1 text-sm text-slate-600">Fill in the details below and we will get it sorted.</p>
      </div>

      {/* General submission error */}
      {errors.submit && (
        <div className="rounded-xl border border-[#e53e3e]/30 bg-[#e53e3e]/5 px-4 py-3 text-sm text-[#e53e3e]">
          {errors.submit}
        </div>
      )}

      {/* Card wrapper */}
      <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 space-y-5 sm:p-6">

        {/* Title */}
        <div>
          <label htmlFor="title" className={labelClasses}>Title</label>
          <input
            id="title"
            type="text"
            className={inputClasses}
            placeholder="Brief summary of the issue"
            maxLength={100}
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          {errors.title && <p className={errorClasses}>{errors.title}</p>}
          <p className="mt-1 text-xs text-[#101312]/75">{form.title.length}/100</p>
        </div>

        {/* Category and Hostel Block row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Category */}
          <div>
            <label htmlFor="category" className={labelClasses}>Category</label>
            <select
              id="category"
              className={inputClasses}
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.category && <p className={errorClasses}>{errors.category}</p>}
          </div>

          {/* Hostel Block */}
          <div>
            <label htmlFor="hostelBlock" className={labelClasses}>Hostel Block</label>
            <select
              id="hostelBlock"
              className={inputClasses}
              value={form.hostelBlock}
              onChange={(e) => handleChange('hostelBlock', e.target.value)}
            >
              <option value="">Select block...</option>
              {hostelBlocks.map((block) => (
                <option key={block} value={block}>Block {block}</option>
              ))}
            </select>
            {errors.hostelBlock && <p className={errorClasses}>{errors.hostelBlock}</p>}
          </div>
        </div>

        {/* Room Number */}
        <div className="max-w-xs">
          <label htmlFor="roomNumber" className={labelClasses}>Room Number</label>
          <input
            id="roomNumber"
            type="text"
            className={inputClasses}
            placeholder="e.g. 301"
            maxLength={4}
            value={form.roomNumber}
            onChange={(e) => handleChange('roomNumber', e.target.value)}
          />
          {errors.roomNumber && <p className={errorClasses}>{errors.roomNumber}</p>}
        </div>

        {/* Priority */}
        <div>
          <span className={labelClasses}>Priority</span>
          <div className="mt-1 flex flex-wrap gap-3">
            {priorityOptions.map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={opt.value}
                  checked={form.priority === opt.value}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="peer sr-only"
                />
                <span className={`inline-block rounded-xl border border-[#101312]/15 px-4 py-2 text-sm text-[#101312]/75 transition peer-checked:font-semibold peer-checked:text-[#101312] ${opt.color}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
          {errors.priority && <p className={errorClasses}>{errors.priority}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClasses}>Description</label>
          <textarea
            id="description"
            className={`${inputClasses} min-h-[120px] resize-y`}
            placeholder="Describe the issue in detail (location, when it started, etc.)"
            maxLength={500}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          {errors.description && <p className={errorClasses}>{errors.description}</p>}
          <p className="mt-1 text-xs text-[#101312]/75">{form.description.length}/500</p>
        </div>

        {/* File Upload */}
        <div>
          <span className={labelClasses}>Attachments (optional)</span>
          <p className="mb-2 text-xs text-[#101312]/75">Max {MAX_FILES} files. JPG or PNG only, up to 5MB each.</p>

          {/* Upload button area */}
          <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#101312]/15 bg-[#101312]/[0.02] px-4 py-8 text-sm text-[#101312]/80 transition hover:border-[#BAF91A] hover:bg-[#BAF91A]/5 hover:text-[#101312]">
            <span>Click to upload images</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={files.length >= MAX_FILES}
            />
          </label>
          {errors.files && <p className={errorClasses}>{errors.files}</p>}

          {/* Thumbnail previews */}
          {previews.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {previews.map((url, i) => (
                <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-[#101312]/10">
                  <img src={url} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                  {/* Remove button overlay */}
                  <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-violet-600 opacity-0 transition group-hover:opacity-100"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove file ${i + 1}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#BAF91A] px-8 py-2.5 text-sm font-medium text-[#101312] transition hover:bg-[#a9ea00] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </div>
    </form>
  )
}

export default SubmitComplaint
