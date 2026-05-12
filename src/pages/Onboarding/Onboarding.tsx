import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Onboarding.module.css'

const stitchPatterns = [
  'Stockinette',
  'Ribbing',
  'Garter stitch',
  'Lace',
  'Cables',
  'Texture',
  'Not sure',
]

const defaultValues = {
  projectName: '',
  sessionNumber: '',
  garmentType: '',
  size: '',
  stitchPattern: ['Not sure'],
}

function isFormEmpty(form: typeof defaultValues) {
  return (
    form.projectName === '' &&
    form.sessionNumber === '' &&
    form.garmentType === '' &&
    form.size === '' &&
    form.stitchPattern.length === 1 &&
    form.stitchPattern[0] === 'Not sure'
  )
}

function Onboarding() {
  const [form, setForm] = useState(defaultValues)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleStitchPatternChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value, checked } = e.target
    if (checked) {
      setForm({ ...form, stitchPattern: [...form.stitchPattern, value] })
    } else {
      setForm({ ...form, stitchPattern: form.stitchPattern.filter(p => p !== value) })
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isFormEmpty(form)) {
      setShowConfirm(true)
      return
    }
    navigate('/counter', { state: form })
  }

  function handleSkip() {
    navigate('/counter', { state: defaultValues })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Count Me In</h1>
        <p className={styles.subtitle}>Tell us about your project — or skip and start counting.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="projectName">Project name</label>
            <input
              id="projectName"
              name="projectName"
              type="text"
              placeholder="Moby Sweater"
              value={form.projectName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="sessionNumber">Session number</label>
            <input
              id="sessionNumber"
              name="sessionNumber"
              type="number"
              placeholder="3"
              min="1"
              value={form.sessionNumber}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="garmentType">Garment type</label>
            <select
              id="garmentType"
              name="garmentType"
              value={form.garmentType}
              onChange={handleChange}
            >
              <option value="">Select a garment</option>
              <option value="Sweater / cardigan">Sweater / cardigan</option>
              <option value="Top">Top</option>
              <option value="Skirt">Skirt</option>
              <option value="Dress">Dress</option>
              <option value="Slipover">Slipover</option>
              <option value="Vest">Vest</option>
              <option value="Camisole">Camisole</option>
              <option value="Blouse">Blouse</option>
              <option value="Jacket">Jacket</option>
              <option value="Hat">Hat</option>
              <option value="Scarf">Scarf</option>
              <option value="Mittens">Mittens</option>
              <option value="Socks">Socks</option>
              <option value="Slippers">Slippers</option>
              <option value="Shawl">Shawl</option>
              <option value="Blanket">Blanket</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="size">Size</label>
            <input
              id="size"
              name="size"
              type="text"
              placeholder="M"
              value={form.size}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label>Stitch pattern</label>
            <div className={styles.checkboxGroup}>
              {stitchPatterns.map(pattern => (
                <label key={pattern} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={pattern}
                    checked={form.stitchPattern.includes(pattern)}
                    onChange={handleStitchPatternChange}
                  />
                  {pattern}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.skip} onClick={handleSkip}>
              Skip
            </button>
            <button type="submit" className={styles.submit}>
              Let's knit
            </button>
          </div>
        </form>
      </div>

      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p>You haven't filled in any details. Would you like to continue anyway?</p>
            <div className={styles.modalActions}>
              <button className={styles.skip} onClick={() => setShowConfirm(false)}>
                Back
              </button>
              <button className={styles.submit} onClick={() => navigate('/counter', { state: defaultValues })}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Onboarding
